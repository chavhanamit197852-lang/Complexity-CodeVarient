import { z } from 'zod';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Note from '@/models/Note';
import Meeting from '@/models/Meeting';
import { noteSchema } from '@/lib/validators';

export async function POST(req) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in' } }, { status: 401 });
  try {
    const body = await req.json();
    const data = noteSchema.parse(body);
    await connectDB();
    const meeting = await Meeting.findOne({ _id: data.meetingId, createdBy: session.userId });
    if (!meeting) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } }, { status: 404 });
    const note = await Note.create({ ...data, createdBy: session.userId });
    return Response.json({ success: true, data: note });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } }, { status: 400 });
    }
    return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Could not create note' } }, { status: 500 });
  }
}
