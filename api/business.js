const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

const {
  addVisitor,
  confirmBusinessVerificationCode,
  createBusiness,
  getBusiness,
  getProfile,
  getQRSettings,
  getVisitors,
  setBusinessProfile,
  setBusinessVerificationCode,
  setQRSettings,
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
        QRCode.toString(`http://192.168.1.71:3000/checkin/${link}`, options)
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
        QRCode.toDataURL(`http://192.168.1.71:3000/checkin/${link}`, options)
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

/**
 * Given an email address and a width, it writes a pdf application object
 * to the provided stream.
 * To do so, the settings of the pdf qr are retrieved from the database
 * and used.
 *
 * @param {String} email
 * @param {number} width
 * @param {object} stream
 */
module.exports.businessGetQRPdf = (email, width, stream) => {
  const fontSizes = [8, 12, 18, 24];
  const qrSizes = [260, 320, 400, 468];
  const colors = ["black", "red", "green", "blue", "yellow", "orange"];
  const alignments = ["left", "center", "right", "justify"];

  return new Promise((resolve, reject) => {
    businessGetQRDataURL(email, width)
      .then(async (url) => {
        const qrPdfSettings = (await getQRSettings(email)).pdf;
        console.log(qrPdfSettings);
        const doc = new PDFDocument({ Title: "QR Code" });
        doc.pipe(stream);

        // creates the top line of the pdf
        const topLineHeight =
          qrPdfSettings.topLine.fontSize < 2
            ? 15
            : qrPdfSettings.topLine.fontSize === 2
            ? 20
            : 25;
        if (qrPdfSettings.topLine.text !== "") {
          doc
            .fontSize(fontSizes[qrPdfSettings.topLine.fontSize])
            .fillColor(colors[qrPdfSettings.topLine.fontColor])
            .text(qrPdfSettings.topLine.text, {
              align: "center",
              height: topLineHeight,
            });
        }

        // creates the qr image
        doc.image(
          url,
          72,
          qrPdfSettings.topLine.text !== "" ? 72 + topLineHeight : 72,
          {
            fit: [468, qrSizes[qrPdfSettings.qrImageSize]],
            align: "center",
            valign: "center",
          }
        );
        let currentHeight =
          72 + topLineHeight + qrSizes[qrPdfSettings.qrImageSize] + 15;

        // creates the first paragraph, if required
        if (qrPdfSettings.paragraphCount > 0) {
          let parSettings = qrPdfSettings.paragraph1;
          doc
            .fontSize(fontSizes[parSettings.fontSize])
            .fillColor(colors[parSettings.fontColor])
            .text(parSettings.text, 72, currentHeight, {
              width: 468,
              align: alignments[parSettings.alignment],
            });
        }

        // creates the second paragraph, if required
        if (qrPdfSettings.paragraphCount > 1) {
          let parSettings = qrPdfSettings.paragraph2;
          if (qrPdfSettings.paragraph1.spaceAfter) doc.moveDown();

          doc
            .fontSize(fontSizes[parSettings.fontSize])
            .fillColor(colors[parSettings.fontColor])
            .text(parSettings.text, {
              width: 468,
              align: alignments[parSettings.alignment],
            });
        }

        // creates the third paragraph, if required
        if (qrPdfSettings.paragraphCount > 2) {
          let parSettings = qrPdfSettings.paragraph3;
          if (qrPdfSettings.paragraph2.spaceAfter) doc.moveDown();

          doc
            .fontSize(fontSizes[parSettings.fontSize])
            .fillColor(colors[parSettings.fontColor])
            .text(parSettings.text, {
              width: 468,
              align: alignments[parSettings.alignment],
            });
        }

        doc.end();
        resolve(true);
      })
      .catch((error) => {
        console.log({ error });
        reject(error);
      });
  });
};

/**
 * Given an email address, returns the QR settings.
 *
 * @param {String} email
 */
module.exports.businessGetQRPdfSettings = (email) => {
  return new Promise((resolve, reject) => {
    getQRSettings(email)
      .then((settings) => {
        resolve(settings);
      })
      .catch((db_error) => {
        console.log({ db_error });
        reject(db_error);
      });
  });
};

/**
 * Sets the provided settings for the given business.
 *
 * @param {String}                                                  email
 * @param {Array.<{field: Array.<string>, value: (String|Number)}>} settings
 */
module.exports.businessSetQRPdfSettings = (email, settings) => {
  return new Promise((resolve, reject) => {
    setQRSettings(email, settings)
      .then((result) => {
        resolve(result);
      })
      .catch((db_error) => {
        console.error({ db_error });
        reject(db_error);
      });
  });
};

/**
 * Adds a new visitor to the database.
 *
 * @param {String}   businessLink
 * @param {String}   visitorEmail
 * @param {String}   visitorFirstName
 * @param {String}   visitorLastName
 * @param {Date}     visitorBirthday
 * @param {Boolean}  dummy            If set to true, this api will not change the database.
 */
module.exports.businessAddVisitor = (
  businessLink,
  visitorEmail,
  visitorFirstName,
  visitorLastName,
  visitorBirthday,
  dummy
) => {
  return new Promise((resolve, reject) => {
    addVisitor(
      businessLink,
      visitorEmail,
      visitorFirstName,
      visitorLastName,
      visitorBirthday,
      dummy
    )
      .then((submissionMessage) => {
        resolve(submissionMessage);
      })
      .catch((db_error) => {
        console.error({ db_error });
        reject(db_error);
      });
  });
};

/**
 * Returns the number of visitors who have visited the given business
 * in the given range.
 *
 * @param {String}  email
 * @param {Date}    from  If undefined, the start of time is considered.
 * @param {Date}    to    If undefined, the end of time is considered.
 */
module.exports.businessGetVisitorCount = (email, from, to) => {
  return new Promise((resolve, reject) => {
    getVisitors(email, from, to, true)
      .then((count) => {
        resolve(count);
      })
      .catch((db_error) => {
        console.error({ db_error });
        reject(db_error);
      });
  });
};
