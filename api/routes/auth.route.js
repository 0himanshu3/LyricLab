import express from 'express';
import { googleAuth, signin, signup } from '../controllers/auth.controller.js';
import passport from 'passport';
const router = express.Router();

// GitHub authentication route
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), 
  (req, res) => {
    // Send a JSON response with the desired redirect URL
    const userId = req.user._id;  // Assuming _id is available for the user
    // Redirect to AfterGitHubLogin component with user ID
    res.redirect(`http://localhost:5173/after-github-login?userId=${userId}`);
  }
);
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleAuth)

export default router;