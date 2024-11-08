import Recording from '../models/recording.model.js';
import cloudinary from '../utils/cloudinaryConfig.js';
import { errorHandler } from '../utils/error.js';
import fs from 'fs';

// Create a new recording with Cloudinary upload
export const createRecording = async (req, res, next) => {
  try {
    const { title, transcription } = req.body;
    const filePath = req.file.path;

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Allows uploading audio files
      folder: 'recordings',
    });

    const newRecording = await Recording.create({
      userId: req.user.id,
      title,
      filePath: uploadResult.secure_url, // Use URL from Cloudinary
      transcription,
    });

    res.status(201).json(newRecording);
    fs.unlink(req.file.path, (err) => {
      if (err)
        console.error('Error deleting file:', err);
    });
  }

  catch (error) {
    // Handle errors and cleanup if needed
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};

// Get all recordings for a user
export const getUserRecordings = async (req, res, next) => {
  try {
    const recordings = await Recording.find({ userId: req.user.id });
    res.status(200).json(recordings);
  } catch (error) {
    next(error);
  }
};

// Get a single recording by ID
export const getRecordingById = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.recordingId);
    if (!recording || recording.userId.toString() !== req.user.id) {
      return next(errorHandler(404, 'Recording not found'));
    }

    res.status(200).json(recording);
  } catch (error) {
    next(error);
  }
};

// Delete a recording by ID
export const deleteRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.recordingId);
    if (!recording || recording.userId.toString() !== req.user.id) {
      return next(errorHandler(404, 'Recording not found'));
    }

    // Delete file from Cloudinary
    const publicId = recording.filePath.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`recordings/${publicId}`, { resource_type: 'video' });

    await recording.remove();
    res.status(200).json({ message: 'Recording deleted successfully' });
  } catch (error) {
    next(error);
  }
};
