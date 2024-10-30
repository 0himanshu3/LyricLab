import mongoose from 'mongoose';


const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
    },
    category: {
      type: String,
      default: 'uncategorized',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'low',
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'pending',
    },
    subtasks: [subtaskSchema], // Include the subtasks array
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
