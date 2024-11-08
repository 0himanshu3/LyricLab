import mongoose, { Schema } from "mongoose";

const recordingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    title: { type: String, required: true }, 
    filePath: { type: String, required: true }, 
    transcription: { type: String }, 
    createdAt: { type: Date, default: Date.now }, 
  },
  { timestamps: true }
);

const Recording = mongoose.model("Recording", recordingSchema);
export default Recording;