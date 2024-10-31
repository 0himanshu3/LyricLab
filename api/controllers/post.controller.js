import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }

  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};


export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }

  const { title, content, category, image, priority, deadline, subtasks } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title,
          content,
          category,
          image,
          priority,
          deadline,
          subtasks: subtasks ? subtasks.map(subtask => ({
            _id: subtask.id,
            completed: subtask.completed,
            title: subtask.title // Ensure to keep the title if needed
          })) : undefined, // Only update subtasks if provided
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return next(errorHandler(404, 'Post not found'));
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};



// Toggle Subtask Completion
export const toggleSubtaskCompletion = async (req, res) => {
  try {
    const post = await Post.findOne({ 'subtasks._id': req.params.subtaskId });
    if (!post) {
      return res.status(404).json({ error: 'Post or subtask not found' });
    }

    const subtask = post.subtasks.id(req.params.subtaskId);
    subtask.completed = !subtask.completed;
    await post.save();

    res.status(200).json({ message: 'Subtask completion toggled', subtask });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the subtask' });
  }
};


// Complete Task
export const completeTask = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Update the main task and each subtask's completed status
    post.status = "completed";
    post.subtasks = post.subtasks.map(subtask => ({
      ...subtask,
      completed: true
    }));

    // Save the post with updated subtasks
    await post.save();

    res.status(200).json({ message: 'Task and subtasks completed successfully', post });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while completing the task' });
  }
};


// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the task' });
  }
};