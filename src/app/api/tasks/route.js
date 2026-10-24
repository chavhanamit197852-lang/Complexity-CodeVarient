import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Task from '@/models/Task';
import { taskSchema } from '@/lib/validators';

export async function GET(req) {
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  await connectDB();
  const filter = { createdBy: session.userId };
  if (status && ['pending', 'in-progress', 'completed'].includes(status)) filter.status = status;
  const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return Response.json({ success: true, data: tasks });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = taskSchema.parse(body);
    await connectDB();
    const task = await Task.create({ ...data, createdBy: session.userId });
    return Response.json({ success: true, data: task });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } }, { status: 400 });
    }
    return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Could not create task' } }, { status: 500 });
  }
}
