import mongoose, { Schema } from "mongoose";

const requestschema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requests: [{ type: Schema.Types.ObjectId, ref: "Post", required: true }],
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestschema);

export default Request;
