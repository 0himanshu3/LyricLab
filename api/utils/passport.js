import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create a user in MongoDB
    let user = await User.findOne({ email: profile.emails[0]?.value});    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({
        username: profile.username,
        email: profile.emails[0]?.value,
        profileImage: profile.photos[0]?.value,
        password: 'password',

      });
      await user.save(); // Save new user to DB
    } else {
      // If user exists, you can update their info if needed
      user.accessToken = accessToken;
      await user.save(); // Save the updated user info
    }
    // After the database update, return the user object
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

export default passport;