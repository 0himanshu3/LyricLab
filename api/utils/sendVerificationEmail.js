// import transporter from './nodemailerConfig.js';
// import generateToken from './generateToken.js';

// const sendVerificationEmail = async (user) => {
//   const token = generateToken(user._id);
//   const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER, // Ensure this is your Gmail address
//     to: user.email,
//     subject: 'Verify Your Email',
//     html: `<h1>Email Verification</h1>
//            <p>Click the link below to verify your email:</p>
//            <a href="${verificationLink}">Verify Email</a>`,
//   };

//   return transporter.sendMail(mailOptions);
// };

// export default sendVerificationEmail;
