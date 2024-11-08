// import { google } from 'googleapis';
// import dotenv from 'dotenv';

// dotenv.config();

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;

// const oauth2Client = new google.auth.OAuth2(
//   GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET,
//   'postmessage',
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN, // Ensure that this environment variable is set
// });

// // Function to get the current access token (using refresh token)
// export const getAccessToken = async () => {
//   try {
//     const { token } = await oauth2Client.getAccessToken();
//     return token;  // This is the access token
//   } catch (error) {
//     console.error('Error fetching access token:', error);  // Added detailed logging
//     throw new Error('Error fetching access token');  // Throwing an error to handle it higher up
//   }
// };

// // Generate the authorization URL for OAuth2 consent flow
// export const generateAuthUrl = () => {
//   try {
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: ['https://www.googleapis.com/auth/gmail.send'],
//     });
//     return authUrl;
//   } catch (error) {
//     console.error('Error generating auth URL:', error);  // Added detailed logging
//     throw new Error('Error generating auth URL');
//   }
// };

// // Optional: Refresh the access token manually if needed
// export const refreshAccessToken = async () => {
//   try {
//     const { credentials } = await oauth2Client.refreshAccessToken();
//     oauth2Client.setCredentials(credentials);
//     return credentials.access_token;
//   } catch (error) {
//     console.error('Error refreshing access token:', error);  // Added detailed logging
//     throw new Error('Error refreshing access token');
//   }
// };

// export { oauth2Client };
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
);