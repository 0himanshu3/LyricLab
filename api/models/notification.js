import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    text: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Post" },
    notiType: { type: String, default: "alert", enum: ["alert", "message"] },
    isRead: { type: Boolean, default: false },
    deadline: { type: Date, required: true },
    oneWeekReminderSent: { type: Boolean, default: false },
    oneDayReminderSent: { type: Boolean, default: false },
    oneWeekReminderRead: { type: Boolean, default: false },
    oneDayReminderRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userNoticeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    notifications: [noticeSchema], 
  },
  { timestamps: true }
);

const UserNotice = mongoose.model("UserNotice", userNoticeSchema);
const Notice = mongoose.model("Notice", noticeSchema);

export { UserNotice, Notice }; 
