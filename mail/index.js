const nodemailer = require("nodemailer");

module.exports.sendVerificationCodeSignUp = (verificationCode, email) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporter
      .verify()
      .then((info) => {
        let message = {
          from: "Covid19 Alert <covid19alert_alberta@outlook.com>",
          to: email,
          subject: "Verification Code",
          text: `Your verification code is: ${verificationCode}.`,
          html: `<p>Your verification code is: <b>${verificationCode}</b>.</p>`,
        };

        transporter.sendMail(message, (send_err, res) => {
          if (send_err) {
            console.log("send_err: " + send_err);
            reject({
              error: {
                id: 100010,
                message: "Connection to the mail server failed.",
              },
            });
          } else {
            resolve();
          }
        });
      })
      .catch((smtp_error) => {
        console.log("smtp_error: " + smtp_error);
        reject({
          error: {
            id: 100009,
            message: "Connection to the mail server failed.",
          },
        });
      });
  });
};
