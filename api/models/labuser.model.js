import mongoose from 'mongoose';
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const labuserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    verified: { 
      type: Boolean, 
      default: false
    },

  },
  { timestamps: true }
);

const Labuser = mongoose.model('Labuser', labuserSchema);

export default Labuser;
