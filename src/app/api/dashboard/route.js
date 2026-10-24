import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Meeting from '@/models/Meeting';
import Task from '@/models/Task';
import Note from '@/models/Note';

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in' } }, { status: 401 });
  await connectDB();
  const userId = session.userId;

  const [meetingCount, taskCount, noteCount, pendingCount, recentMeetings, pendingTasks] = await Promise.all([
    Meeting.countDocuments({ createdBy: userId }),
    Task.countDocuments({ createdBy: userId }),
    Note.countDocuments({ createdBy: userId }),
    Task.countDocuments({ createdBy: userId, status: { $ne: 'completed' } }),
    Meeting.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5).lean(),
    Task.find({ createdBy: userId, status: { $ne: 'completed' } }).sort({ dueDate: 1 }).limit(5).lean(),
  ]);

  return Response.json({
    success: true,
    data: {
      stats: { meetings: meetingCount, tasks: taskCount, notes: noteCount, openTasks: pendingCount },
      recentMeetings,
      pendingTasks,
    },
  });
}
