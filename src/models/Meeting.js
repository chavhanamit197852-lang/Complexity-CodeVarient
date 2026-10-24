import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    date: { type: Date, default: Date.now },
    participants: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

MeetingSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);
