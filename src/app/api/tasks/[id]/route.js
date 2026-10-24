import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Task from '@/models/Task';
import { taskUpdateSchema } from '@/lib/validators';

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in' } }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return Response.json({ success: false, error: { code: 'INVALID_ID', message: 'Bad id' } }, { status: 400 });
  }
  try {
    const body = await req.json();
    const data = taskUpdateSchema.parse(body);
    await connectDB();
    const updated = await Task.findOneAndUpdate(
      { _id: params.id, createdBy: session.userId },
      { $set: data },
      { new: true }
    );
    if (!updated) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
    return Response.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } }, { status: 400 });
    }
    return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Update failed' } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in' } }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return Response.json({ success: false, error: { code: 'INVALID_ID', message: 'Bad id' } }, { status: 400 });
  }
  await connectDB();
  const deleted = await Task.findOneAndDelete({ _id: params.id, createdBy: session.userId });
  if (!deleted) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
  return Response.json({ success: true, data: { id: params.id } });
}
