import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Meeting from '@/models/Meeting';
import { meetingUpdateSchema } from '@/lib/validators';

const guard = async (id) => {
  const session = await getSession();
  if (!session?.userId) return { error: 'UNAUTHORIZED' };
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: 'INVALID_ID' };
  return { userId: session.userId };
};

export async function GET(req, { params }) {
  const { error, userId } = await guard(params.id);
  if (error) return Response.json({ success: false, error: { code: error, message: 'Unauthorized or invalid' } }, { status: error === 'UNAUTHORIZED' ? 401 : 400 });
  await connectDB();
  const meeting = await Meeting.findOne({ _id: params.id, createdBy: userId }).lean();
  if (!meeting) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } }, { status: 404 });
  return Response.json({ success: true, data: meeting });
}

export async function PATCH(req, { params }) {
  const { error, userId } = await guard(params.id);
  if (error) return Response.json({ success: false, error: { code: error, message: 'Unauthorized or invalid' } }, { status: error === 'UNAUTHORIZED' ? 401 : 400 });
  try {
    const body = await req.json();
    const data = meetingUpdateSchema.parse(body);
    await connectDB();
    const updated = await Meeting.findOneAndUpdate(
      { _id: params.id, createdBy: userId },
      { $set: data },
      { new: true }
    );
    if (!updated) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } }, { status: 404 });
    return Response.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } }, { status: 400 });
    }
    return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Update failed' } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { error, userId } = await guard(params.id);
  if (error) return Response.json({ success: false, error: { code: error, message: 'Unauthorized or invalid' } }, { status: error === 'UNAUTHORIZED' ? 401 : 400 });
  await connectDB();
  const deleted = await Meeting.findOneAndDelete({ _id: params.id, createdBy: userId });
  if (!deleted) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } }, { status: 404 });
  return Response.json({ success: true, data: { id: params.id } });
}
