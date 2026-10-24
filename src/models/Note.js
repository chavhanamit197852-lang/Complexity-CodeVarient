import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    content: { type: String, required: true, maxlength: 10000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

NoteSchema.index({ meetingId: 1, createdAt: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
