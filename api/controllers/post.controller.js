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

  // Create a new post instance with the provided data
  const newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    image: req.body.image || undefined, // Use provided image or default
    category: req.body.category || 'uncategorized', // Default category if not provided
    slug,
    userId: req.user.id,
    priority: req.body.priority || 'low', // Default priority if not provided
    deadline: req.body.deadline || undefined, // Optional field
    isCollaborative: req.body.isCollaborative || false, // Collaboration flag
    teamName: req.body.teamName || '', // Team name
    collaborators: req.body.selectedCollaborators || [], // Collaborators list
    subtasks: req.body.subtasks || [] // Subtasks array
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};


export const getposts = async (req, res) => {
  try {
    const { userId,searchTerm, sort = 'desc', category = 'uncategorized', priority = 'all', deadline = 'all', limit = 10, skip = 0 } = req.query; // Get filters from query
    
    const query = {
      $or: [
        { userId: userId }, // Match posts created by the user
        { 'collaborators.value': userId } // Match posts where the user is a collaborator
      ]
    };
  
    // Apply additional filters if provided
    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }
    if (category && category!=='uncategorized') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (deadline && deadline !== 'all') {
      const today = new Date();
      let dateFilter;
      switch (deadline) {
        case 'this_week':
          dateFilter = new Date(today.setDate(today.getDate() + 7));
          query.deadline = { $lte: dateFilter }; // Tasks due this week
          break;
        case 'next_week':
          dateFilter = new Date(today.setDate(today.getDate() + 14));
          query.deadline = { $gt: new Date(), $lte: dateFilter }; // Tasks due next week
          break;
        case 'this_month':
          dateFilter = new Date(today.setMonth(today.getMonth() + 1));
          query.deadline = { $lte: dateFilter }; // Tasks due this month
          break;
      }
    }

    // Fetch posts from the database with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .exec();

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Extract slug from URL parameters

    // Check if slug is provided
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    // Find post by slug
    const post = await Post.findOne({ slug }).exec();

    // If post is not found, return 404
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Return the found post
    res.status(200).json( post );
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Failed to fetch post by slug' });
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
          subtasks,
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

export const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
};