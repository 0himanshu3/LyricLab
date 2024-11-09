// import nodemailer from 'nodemailer';
// import { oauth2Client } from './googleClient.js'; // This is your OAuth 2.0 client
// import dotenv from 'dotenv';
// import { google } from 'googleapis';
// dotenv.config();

// // Create reusable transporter object using the Gmail service and OAuth2
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',
//     user: process.env.EMAIL_USER, // your Gmail address
//     clientId: process.env.OAUTH_CLIENT_ID,
//     clientSecret: process.env.OAUTH_CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN, // The refresh token you obtained during OAuth process
//     accessToken: oauth2Client.getAccessToken(), // Function to retrieve access token
//   },
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Error in email transport configuration:', error);
//   } else {
//     console.log('Email transport is ready:', success);
//   }
// });

// export default transporter;
