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
  getteamposts,
  getpersonalposts,
  updatePostOrder,
  archivePost,
  restoreTask,
  addActivityToPost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create',verifyToken,create);
router.get('/getposts', getposts);
router.get('/getteamposts', getteamposts);
router.get('/getpersonalposts', getpersonalposts);
router.get('/getpostbyslug/:slug',getPostBySlug);
router.get('/getpostbyid/:postId',getPostById);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);
router.put('/:postId/archive', verifyToken, archivePost);
router.put('/:postId/restore', verifyToken, restoreTask);
router.patch('/:postId/complete-subtasks', completeTask);
router.patch('/update-order', verifyToken, updatePostOrder);
//to update the order of the post
router.patch('/:postId/:userId/add-activity', addActivityToPost
);
// Delete a task
router.delete('/:postId', deleteTask);

// Toggle subtask completion
router.patch('/subtasks/:subtaskId/toggle-completion', toggleSubtaskCompletion);

export default router;
