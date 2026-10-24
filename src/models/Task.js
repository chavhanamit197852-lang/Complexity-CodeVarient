import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending', index: true },
    dueDate: { type: Date },
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

TaskSchema.index({ createdBy: 1, status: 1, dueDate: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
