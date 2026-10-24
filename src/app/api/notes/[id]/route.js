import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Note from '@/models/Note';

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in' } }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return Response.json({ success: false, error: { code: 'INVALID_ID', message: 'Bad id' } }, { status: 400 });
  }
  await connectDB();
  const deleted = await Note.findOneAndDelete({ _id: params.id, createdBy: session.userId });
  if (!deleted) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Note not found' } }, { status: 404 });
  return Response.json({ success: true, data: { id: params.id } });
}
