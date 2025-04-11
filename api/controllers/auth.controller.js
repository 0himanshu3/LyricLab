import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../utils/googleClient.js';
import axios from 'axios';
import { sendVerificationEmail, sendWelcomeEmail } from "../middleware/Email.js";
import dotenv from 'dotenv';
dotenv.config();

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  // Check if all fields are provided
  if (!username || !email || !password || username === '' || email === '' || password === '') {
    return next(errorHandler(400, 'All fields are required.'));
  }

  // Validate password
  if (password) {
    if (password.length < 8) {
      return next(errorHandler(400, 'Password must be at least 8 characters.'));
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(password)) {
      return next(
        errorHandler(400, 'Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.')
      );
    }

    // Hash password after validation
    req.body.password = bcryptjs.hashSync(password, 10);
  }

  // Validate username
  if (username) {
    if (username.length < 3 || username.length > 20) {
      return next(errorHandler(400, 'Username must be between 3 and 20 characters.'));
    }

    if (username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces.'));
    }

    if (username !== username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be in lowercase.'));
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return next(errorHandler(400, 'Username can only contain letters and numbers.'));
    }
  }

  // Check if the email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(errorHandler(400, 'Email is already in use. Please use a different email.'));
  }

  // Create new user
  const newUser = new User({
    username,
    email,
    password: req.body.password,
  });

  try {
    await newUser.save();
    res.status(201).json({ success: true, message: 'Signup successful!', user: newUser });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, 'An error occurred during signup. Please try again later.'));
  }
};

//New register
export const register = async (req, res, next) => {
  const { name, email, password, verificationCode } = req.body;

  try {
    // Validate input fields
    if (!name || !email || !password || name === "" || email === "" || password === "") {
      return next(errorHandler(400, "All fields are required."));
    }

    // Validate password length and structure
    if (password.length < 8) {
      return next(errorHandler(400, "Password must be at least 8 characters."));
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(password)) {
      return next(errorHandler(400, "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."));
    }

    // Hash the password and check for existing user
    req.body.password = bcryptjs.hashSync(password, 10);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email is already in use. Please use a different email."));
    }

    // Create and save the new user
    const newUser = new User({
      username: name,
      email,
      password: req.body.password,
      verificationCode,
    });
    await newUser.save();

    // Send emails using nodemailer functions
    sendVerificationEmail(newUser.email, verificationCode);
    sendWelcomeEmail(newUser.email);

    res.status(201).json({
      success: true,
      message: "Signup successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return next(new Error("An error occurred during signup. Please try again later."));
  }
};
//verify
export const verifyUser = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found.'));
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    if (user.verificationCode === code) {
      user.verified = true;
      user.verificationCode = undefined; // Clear the verification code
      await user.save();

      res.status(200).json({ success: true, message: 'Your account has been verified!' });
    } else {
      res.status(400).json({ success: false, message: 'Verification code is incorrect.' });
    }
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, 'Verification failed. Please try again.'));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    // Check if the user is verified
    if (!validUser.verified) {
      return res.status(400).json({ message: 'Please verify your email first.' });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, picture } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(' ').join('') +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  console.log("In google Auth");
  const code=req.query.code;
  try {
   
    const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(' ').join('') +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: picture,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    next(error);
  }
};
