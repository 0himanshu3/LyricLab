import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  completeTask,
  create,
  deletepost,
  deleteTask,
  getposts,
  toggleSubtaskCompletion,
  updatepost,
  updateSubtaskCompletion
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

router.patch('/posts/:postId/complete-subtasks', updateSubtaskCompletion);

// Complete a task
router.patch('/posts/:postId/complete', completeTask);

// Delete a task
router.delete('/posts/:postId', deleteTask);

// Toggle subtask completion
router.patch('/subtasks/:subtaskId/toggle-completion', toggleSubtaskCompletion);

export default router;
