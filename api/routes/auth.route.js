import express from 'express';
import { googleAuth, signin, signup } from '../controllers/auth.controller.js';
import passport from 'passport';
// import { getAccessToken, generateAuthUrl } from '../utils/googleClient.js';

const router = express.Router();

// router.get('/auth/callback', async (req, res) => {
//   const { code } = req.query;
  
//   if (!code) {
//     return res.status(400).send('Authorization code is missing.');
//   }

//   try {
//     const tokens = await getAccessToken(code); // Get the tokens using the authorization code
//     res.json(tokens); // Respond with tokens
//   } catch (error) {
//     console.error('Error during Google OAuth callback:', error);
//     res.status(500).send('Error retrieving tokens');
//   }
// });

// router.get('/auth', (req, res) => {
//   try {
//     const authUrl = generateAuthUrl();
//     res.redirect(authUrl);  // Redirect user to Google for authorization
//   } catch (error) {
//     console.error('Error during OAuth URL generation:', error);
//     res.status(500).send('Error generating authorization URL');
//   }
// });

// // Email verification route
// router.get('/verify/:token', verifyEmail);

// GitHub authentication routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), 
  (req, res) => {
    const userId = req.user._id;
    res.redirect(`http://localhost:5173/after-github-login?userId=${userId}`);
  }
);

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleAuth);

export default router;
