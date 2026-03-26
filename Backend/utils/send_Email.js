// const nodemailer = require("nodemailer");
// require("dotenv").config();


// const sendEmail = async (to, subject, text) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   // host: process.env.EMAIL_HOST,
//   // port: process.env.EMAIL_PORT,
//   // auth: {
//   //   user: process.env.EMAIL_USER,
//   //   pass: process.env.EMAIL_PASS,
//   //    },
//   // });

//   await transporter.sendMail({
//     from: `"Task Manager App "<${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text
//   });
//   console.log("Email Sent Successfully");
// };

// module.exports = sendEmail;
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  if (!to || to.trim() === "") {
    console.log("Skipping email: no recipient defined");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Task Manager App" <${process.env.EMAIL_USER}>`,
    to: to.trim(),
    subject,
    html
  });

  console.log(`Email sent successfully to ${to}`);
};

module.exports = sendEmail;