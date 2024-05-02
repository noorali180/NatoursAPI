const nodemailer = require("nodemailer");

// options -> {email address (to, from), subject, body, and other things}
const sendEmail = async (options) => {
  // 1) create a transporter // note: transporter is a service which will send the email, not the nodeJS

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // activate in gmail, "less secure app" option

  // 2) Define the email options (generate a mail)
  const mailOptions = {
    from: "Noor Ali <hello@noor.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) send it to the client with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
