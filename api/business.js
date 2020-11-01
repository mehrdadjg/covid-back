const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

const {
  confirmBusinessVerificationCode,
  createBusiness,
  getBusiness,
  getProfile,
  setBusinessProfile,
  setBusinessVerificationCode,
} = require("../database");

const { sign } = require("../authentication");

const { verificationCodeGen } = require("../utils");
const { sendVerificationCodeSignUp } = require("../mail");

module.exports.businessSignUp = (email, password) => {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject({
        error: {
          id: 100004,
          message: "Field not found.",
          value: !email
            ? !password
              ? ["email", "password"]
              : ["email"]
            : !password
            ? ["password"]
            : [],
        },
      });
    } else {
      createBusiness(email, password)
        .then((newBusiness) => {
          const token = sign(newBusiness.business);

          resolve({
            business: newBusiness.business,
            authentication: { type: "bearer", jwt: token },
          });
        })
        .catch((db_error) => {
          console.log({ db_error });
          reject(db_error);
        });
    }
  });
};

module.exports.businessLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject({
        error: {
          id: 100005,
          message: "Field not found.",
          value: !email
            ? !password
              ? ["email", "password"]
              : ["email"]
            : !password
            ? ["password"]
            : [],
        },
      });
    } else {
      getBusiness(email, password)
        .then((theBusiness) => {
          const token = sign(theBusiness.business);

          resolve({
            business: theBusiness.business,
            authentication: { type: "bearer", jwt: token },
          });
        })
        .catch((db_error) => {
          console.log({ db_error });
          reject(db_error);
        });
    }
  });
};

module.exports.businessGetVerificationEmail = (email) => {
  let verificationCode = verificationCodeGen(6);

  return new Promise((resolve, reject) => {
    setBusinessVerificationCode(email, verificationCode)
      .then((date) => {
        sendVerificationCodeSignUp(verificationCode, email)
          .then(() => {
            resolve(date);
          })
          .catch((mail_error) => {
            console.log({ mail_error });
            reject(mail_error);
          });
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

module.exports.businessSubmitVerificationCode = (email, verificationCode) => {
  return new Promise((resolve, reject) => {
    confirmBusinessVerificationCode(email, verificationCode)
      .then(() => {
        resolve(true);
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

module.exports.businessSaveProfile = (email, profileValues) => {
  return new Promise((resolve, reject) => {
    setBusinessProfile(
      email,
      profileValues.businessName,
      profileValues.businessType,
      profileValues.addressLine1,
      profileValues.addressLine2,
      profileValues.city,
      profileValues.province,
      profileValues.postalCode,
      profileValues.phoneNumber,
      profileValues.preferredTime,
      profileValues.submissionMessage
    )
      .then(() => {
        resolve(true);
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

module.exports.businessGetQRCode = (email, width) => {
  return new Promise((resolve, reject) => {
    getProfile(email)
      .then(([profile, link]) => {
        const options = width
          ? {
              errorCorrectionLevel: "H",
              width: width,
              type: "svg",
            }
          : {
              errorCorrectionLevel: "H",
              type: "svg",
            };
        QRCode.toString(`http://192.168.1.72:3000/checkin/${link}`, options)
          .then((svg) => {
            resolve(svg);
          })
          .catch((qr_error) => {
            console.log({ qr_error });
            reject(qr_error);
          });
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

const businessGetQRDataURL = (email, width) => {
  return new Promise((resolve, reject) => {
    getProfile(email)
      .then(([profile, link]) => {
        const options = width
          ? {
              errorCorrectionLevel: "H",
              width: width,
            }
          : {
              errorCorrectionLevel: "H",
            };
        QRCode.toDataURL(`http://192.168.1.72:3000/checkin/${link}`, options)
          .then((url) => {
            resolve(url);
          })
          .catch((qr_error) => {
            console.log({ qr_error });
            reject(qr_error);
          });
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

module.exports.businessGetQRPdf = (email, width, stream) => {
  return new Promise((resolve, reject) => {
    businessGetQRDataURL(email, width)
      .then((url) => {
        const doc = new PDFDocument({ Title: "QR Code" });
        doc.pipe(stream);

        doc.text("Use your Camera app to scan the following code", {
          align: "center",
          height: 15,
        });
        doc.image(url, 72, 72 + 15, {
          fit: [468, 400],
          align: "center",
          valign: "center",
        });
        let currentHeight = 72 + 15 + 400 + 15;
        doc
          .fontSize(28)
          .text(
            "Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code.",
            72,
            currentHeight,
            { width: 468, align: "justify" }
          );

        doc.fontSize(12).moveDown();
        doc.fillColor("green").fontSize(12).text(
          "Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code.",

          { width: 468, align: "justify" }
        );

        doc.fillColor("black").fontSize(12).text(
          "Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code. Use your Camera app to scan the following code.",

          { width: 468, align: "justify" }
        );

        doc.end();
        resolve(true);
      })
      .catch((error) => {
        console.log({ error });
        reject(error);
      });
  });
};
