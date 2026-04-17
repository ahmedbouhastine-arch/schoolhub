import mongoose from 'mongoose';

const SchoolDataSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'schedule', 'teachers', 'exams', 'lessons'
  data: { type: mongoose.Schema.Types.Mixed, required: true }
});

export default mongoose.models.SchoolData || mongoose.model('SchoolData', SchoolDataSchema);
