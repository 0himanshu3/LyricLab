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

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
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
      default: 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
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
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['completed', 'pending', 'archived'],
      default: 'pending',
    },
    subtasks: [subtaskSchema],
    isCollaborative: {
      type: Boolean,
      default: false,
    },
    teamName: {
      type: String,
      default: '',
    },
    collaborators: [{
      label: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        ref: 'User',
        required: true,
      },
    }],
    order: {
      type: Number,
      default: 0,
    },
    activities: [activitySchema] // Add activities array with activitySchema
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
