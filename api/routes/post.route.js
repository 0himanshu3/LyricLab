import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  completeTask,
  create,
  deletepost,
  deleteTask,
  getPostById,
  getPostBySlug,
  getposts,
  toggleSubtaskCompletion,
  updatepost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.get('/:slug',getPostBySlug);
router.get('/getpostbyid/:postId',getPostById);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

router.patch('/:postId/complete-subtasks', completeTask);

// Delete a task
router.delete('/:postId', deleteTask);

// Toggle subtask completion
router.patch('/subtasks/:subtaskId/toggle-completion', toggleSubtaskCompletion);

export default router;
