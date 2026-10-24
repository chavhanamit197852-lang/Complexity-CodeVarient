import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Meeting from '@/models/Meeting';
import { meetingSchema } from '@/lib/validators';

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
  }
  await connectDB();
  const meetings = await Meeting.find({ createdBy: session.userId }).sort({ createdAt: -1 }).limit(100).lean();
  return Response.json({ success: true, data: meetings });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = meetingSchema.parse(body);
    await connectDB();
    const meeting = await Meeting.create({ ...data, createdBy: session.userId });
    return Response.json({ success: true, data: meeting });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } }, { status: 400 });
    }
    return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Could not create meeting' } }, { status: 500 });
  }
}
