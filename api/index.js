import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import notiRoutes from './routes/noti.route.js'
import requestroutes from './routes/request.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from './utils/passport.js';
import { toggleSubtaskCompletion } from './controllers/post.controller.js';
import cors from 'cors';
import recordingRoutes from './routes/recording.route.js';
import multer from 'multer';

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDB is connected');
  })
  .catch((err) => {
    console.log(err);
  });

// Define the path for static files
const __dirname = path.resolve();

const app = express();

// Middleware for JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' })); // Limit payload size for JSON requests
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Limit payload size for URL-encoded data

// Middleware for cookies and session handling
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Middleware for session and passport initialization (GitHub Auth)
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Set up multer for file uploads with size limit (for example, 10MB)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Use this `upload` middleware where you handle file uploads in your routes
// Example: app.post('/upload', upload.single('file'), (req, res) => { ... });

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

// Set up routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/request',requestroutes)
app.use('/api/noti',notiRoutes);

app.use('/api/recordings', recordingRoutes);

// Serve static files (if you have a frontend built with something like React/Vue)
app.use(express.static(path.join(__dirname, '/client/dist')));

// Catch-all route to serve frontend for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Handle toggling subtask completion
app.patch('/api/subtasks/:subtaskId/toggle-completion', toggleSubtaskCompletion);

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
