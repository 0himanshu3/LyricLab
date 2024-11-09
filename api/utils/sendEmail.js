
// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.OAUTH_CLIENT_SECRET,
//   process.env.OAUTH_CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function sendMail(to, subject, text, html) {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,  // Your email
//         clientId: process.env.OAUTH_CLIENT_SECRET,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     const mailOptions = {
//       from: `Your Name <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html,
//     };

//     const result = await transporter.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     console.error(error);
//   }
// }

// module.exports = sendMail;
