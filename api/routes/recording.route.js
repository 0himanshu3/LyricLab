import express from 'express';
import { createRecording, getUserRecordings, getRecordingById, deleteRecording } from '../controllers/recording.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/multerConfig.js';

const router = express.Router();

// Create a new recording (requires file upload)
router.post('/create', verifyToken, upload.single('file'), createRecording);

// Get all recordings for a user
router.get('/user', verifyToken, getUserRecordings);

// Get a single recording by ID
router.get('/:recordingId', verifyToken, getRecordingById);

// Delete a recording by ID
router.delete('/:recordingId', verifyToken, deleteRecording);

export default router;
