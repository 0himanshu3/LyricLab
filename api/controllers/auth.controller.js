import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../utils/googleClient.js';
import axios from 'axios';
// import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import bcrypt from 'bcryptjs';
import Labuser from '../models/labuser.model.js';
// //verification email
// export const verifyEmail = async (req, res, next) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid token or user not found.' });
//     }

//     user.verified = true;
//     await user.save();
//     res.status(200).json({ message: 'Email verified successfully.' });
//   } catch (error) {
//     console.error('Error during email verification:', error);
//     res.status(400).json({ message: 'Verification failed. Token may have expired.' });
//   }
// };
// //trying to register with verification
// export const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     await sendVerificationEmail(newUser);

//     res.status(201).json({
//       message: 'User registered. Please check your email to verify your account.',
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

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
    req.body.password = bcryptjs.hashSync(password, 10);  // Hash password after validation
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
  try {
    const existingUser = await Labuser.findOne({ email });
    if (existingUser) {
      console.log(existingUser);
      return next(errorHandler(400, 'Email is already in use. Please use a different email.'));
    }

    // Create new user with verified: false
    const newLabuser = new Labuser({
      username,
      email,
      password: req.body.password,
      verified: false  // Set verified to false initially
    });

    // Save new user
    await newLabuser.save();

    // Send verification email
    await sendVerificationEmail(newLabuser);

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Signup successful! Please check your email to verify your account.',
      user: newLabuser  // Corrected this part to send `newLabuser` instead of `newUser`
    });
  } catch (error) {
    console.error('Error during signup:', error);  // Log detailed error
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, `Validation error: ${error.message}`));  // Specific for validation errors
    } else if (error.code === 11000) {
      // Handle duplicate email error (MongoDB error code for duplicate key)
      return next(errorHandler(400, 'Email is already in use. Please use a different email.'));
    } else {
      // General error
      return next(errorHandler(500, `An error occurred during signup: ${error.message || error}`));
    }
  }
};



export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
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

//login
// api/controllers/authController.js
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password.' });
    
    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email to log in.' });
    }

    // Generate token if needed for further authenticated access
    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
