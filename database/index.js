const mongoose = require("mongoose");
const business = require("./models/business");

const Business = require("./models/business");

/**
 * Creates a connection to the mongodb database. This function must
 * be called once inside app.js.
 */
module.exports.connect = () => {
  const connectionString =
    "mongodb+srv://" +
    process.env.MONGO_USER +
    ":" +
    process.env.MONGO_PW +
    "@datacluster.e1tof.mongodb.net/" +
    process.env.MONGO_DB_NAME +
    "?retryWrites=true&w=majority";

  mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  mongoose.set("useCreateIndex", true);
};

getNewLink = () => {
  return new Promise(async (resolve) => {
    const alph = "abcdefghijklmnopqrstuvwxyz";
    let done = false;
    while (!done) {
      let link = "";
      for (let i = 0; i < 5; i++) {
        let index = Math.floor(Math.random() * alph.length);
        link += alph.charAt(index);
      }

      await Business.findOne({ link: link })
        .exec()
        .then((err, doc) => {
          if (!err && !doc) {
            done = true;
          }
        });

      if (done) {
        resolve(link);
      }
    }
  });
};

module.exports.createBusiness = async (email, password) => {
  let chosenLink = "";
  await getNewLink().then((link) => {
    chosenLink = link;
  });

  if (chosenLink === "") {
    reject({
      error: {
        id: 100017,
        message: "Error generating the link.",
        value: email,
      },
    });
  } else {
    const newBusiness = new Business({
      email,
      password,
      link: chosenLink,
      profileCompleted: false,
      emailVerified: "f",
      emailVerificationSentAt: null,
    });

    return new Promise((resolve, reject) => {
      newBusiness
        .save()
        .then((addedBusiness) => {
          if (addedBusiness) {
            resolve({
              business: {
                email: addedBusiness.email,
                emailVerified:
                  addedBusiness.emailVerified === "t" ? true : false,
                emailVerificationSentAt: addedBusiness.emailVerificationSentAt,
                profile: addedBusiness.profile ? addedBusiness.profile : null,
              },
            });
          } else {
            reject({
              error: {
                id: 100001,
                message: "Unidentified error.",
                value: email,
              },
            });
          }
        })
        .catch((mongo_error) => {
          console.error("mongo_error: " + mongo_error);
          if (mongo_error.code == 11000) {
            reject({
              error: {
                id: 100002,
                message: "Duplicate email address.",
                value: email,
              },
            });
          } else {
            reject({
              error: {
                id: 100003,
                message: "Unidentified error.",
                value: email,
              },
            });
          }
        });
    });
  }
};

module.exports.getBusiness = (email, password) => {
  return new Promise((resolve, reject) => {
    Business.findOne({ email, password })
      .then((doc) => {
        if (doc === null) {
          reject({
            error: {
              id: 100007,
              message: "Business does not exist.",
              value: email,
            },
          });
        } else {
          if (doc.emailVerified === "t") {
            resolve({
              business: {
                email: doc.email,
                profileCompleted: doc.profileCompleted,
                emailVerified: true,
                profile: doc.profile ? doc.profile : null,
              },
            });
          } else {
            resolve({
              business: {
                email: doc.email,
                emailVerified: false,
                emailVerificationSentAt: doc.emailVerificationSentAt
                  ? doc.emailVerificationSentAt
                  : null,
                profile: doc.profile ? doc.profile : null,
              },
            });
          }
        }
      })
      .catch((mongo_error) => {
        console.error("mongo_error: " + mongo_error);
        reject({
          error: {
            id: 100006,
            message: "Something went wrong.",
            value: email,
          },
        });
      });
  });
};

module.exports.getProfile = (email) => {
  return new Promise((resolve, reject) => {
    Business.findOne({ email: email }, (err, doc) => {
      if (err) {
        reject({
          error: {
            id: 100014,
            message: "Something went wrong.",
          },
        });
      } else {
        if (doc) {
          if (doc.profile && doc.profile.businessName) {
            resolve([doc.profile, doc.link]);
          } else {
            reject({
              error: {
                id: 100016,
                message: "Profile not available.",
              },
            });
          }
        } else {
          reject({
            error: {
              id: 100015,
              message: "Business not available.",
            },
          });
        }
      }
    });
  });
};

module.exports.setBusinessVerificationCode = (email, verificationCode) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    Business.updateOne(
      { email },
      {
        $set: {
          emailVerified: verificationCode,
          emailVerificationSentAt: now,
        },
      },
      (err, res) => {
        if (err) {
          reject({
            error: {
              id: 100008,
              message: "Something went wrong.",
            },
          });
        } else {
          if (res.nModified === 1) {
            resolve(now);
          } else {
            reject({
              error: {
                id: 100011,
                message: "Could not set the verification code.",
              },
            });
          }
        }
      }
    );
  });
};

module.exports.confirmBusinessVerificationCode = (email, verificationCode) => {
  return new Promise((resolve, reject) => {
    /* Potential for problem, in three lines... */
    Business.updateOne(
      { email: email, emailVerified: verificationCode },
      { $set: { emailVerified: "t" }, $unset: { emailVerificationSentAt: "" } },
      (err, res) => {
        if (err) {
          reject({
            error: {
              id: 100009,
              message: "Something went wrong.",
            },
          });
        } else {
          if (res.nModified === 1) {
            resolve(true);
          } else {
            reject({
              error: {
                id: 100010,
                message: "Something went wrong.",
              },
            });
          }
        }
      }
    );
  });
};

module.exports.setBusinessProfile = (
  email,
  businessName,
  businessType,
  addressLine1,
  addressLine2,
  city,
  province,
  postalCode,
  phoneNumber,
  preferredTime,
  submissionMessage
) => {
  return new Promise((resolve, reject) => {
    const newProfile = {};

    Business.findOne({ email: email })
      .then((doc) => {
        if (doc) {
          if (!doc.profile) doc.profile = {};

          businessName !== undefined &&
            (doc.profile.businessName = businessName);
          businessType !== undefined &&
            (doc.profile.businessType = businessType);
          addressLine1 !== undefined &&
            (doc.profile.addressLine1 = addressLine1);
          addressLine2 !== undefined &&
            (doc.profile.addressLine2 = addressLine2);
          city !== undefined && (doc.profile.city = city);
          province !== undefined && (doc.profile.province = province);
          postalCode !== undefined && (doc.profile.postalCode = postalCode);
          phoneNumber !== undefined && (doc.profile.phoneNumber = phoneNumber);
          preferredTime !== undefined &&
            (doc.profile.preferredTime = preferredTime);
          submissionMessage !== undefined &&
            (doc.profile.submissionMessage = submissionMessage);

          doc.save();
          resolve(true);
        } else {
          reject({
            error: {
              id: 100012,
              message: "Business does not exist.",
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: {
            id: 100013,
            message: "Something went wrong.",
          },
        });
      });
  });
};

/**
 * Retrieves the QR settings from the database.
 *
 * @param {String} email
 */
module.exports.getQRSettings = (email) => {
  return new Promise((resolve, reject) => {
    Business.findOne({ email: email })
      .then((doc) => {
        if (doc) {
          resolve(doc.qrSettings);
        } else {
          reject({
            error: {
              id: 100019,
              message: "Business was not found.",
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: {
            id: 100018,
            message: "Something went wrong.",
          },
        });
      });
  });
};

/**
 *
 * @param {String}                                                  email
 * @param {Array.<{field: Array.<string>, value: (String|Number)}>} settings
 */
module.exports.setQRSettings = (email, settings) => {
  return new Promise((resolve, reject) => {
    if (!settings) {
      reject({
        error: {
          id: 100022,
          message: "Settings are invalid.",
        },
      });
    }
    Business.findOne({ email: email })
      .then((doc) => {
        if (doc) {
          settings.forEach((setting) => {
            if (setting.field.length === 0) {
              return reject({
                error: {
                  id: 100023,
                  message: "Field is invalid.",
                },
              });
            } else if (setting.field.length === 1) {
              if (setting.field[0] === "qrImageSize") {
                doc.qrSettings.pdf.qrImageSize = setting.value;
              } else if (setting.field[0] === "paragraphCount") {
                doc.qrSettings.pdf.paragraphCount = setting.value;
              }
            } else if (setting.field.length === 2) {
              if (setting.field[0] === "topLine") {
                if (setting.field[1] === "text") {
                  doc.qrSettings.pdf.topLine.text = setting.value;
                } else if (setting.field[1] === "fontSize") {
                  doc.qrSettings.pdf.topLine.fontSize = setting.value;
                } else if (setting.field[1] === "fontColor") {
                  doc.qrSettings.pdf.topLine.fontColor = setting.value;
                } else {
                  return reject({
                    error: {
                      id: 100027,
                      message: "Field is invalid.",
                    },
                  });
                }
              } else if (setting.field[0] === "paragraph1") {
                if (setting.field[1] === "text") {
                  doc.qrSettings.pdf.paragraph1.text = setting.value;
                } else if (setting.field[1] === "fontSize") {
                  doc.qrSettings.pdf.paragraph1.fontSize = setting.value;
                } else if (setting.field[1] === "alignment") {
                  doc.qrSettings.pdf.paragraph1.alignment = setting.value;
                } else if (setting.field[1] === "fontColor") {
                  doc.qrSettings.pdf.paragraph1.fontColor = setting.value;
                } else if (setting.field[1] === "spaceAfter") {
                  doc.qrSettings.pdf.paragraph1.spaceAfter = setting.value;
                } else {
                  return reject({
                    error: {
                      id: 100028,
                      message: "Field is invalid.",
                    },
                  });
                }
              } else if (setting.field[0] === "paragraph2") {
                if (setting.field[1] === "text") {
                  doc.qrSettings.pdf.paragraph2.text = setting.value;
                } else if (setting.field[1] === "fontSize") {
                  doc.qrSettings.pdf.paragraph2.fontSize = setting.value;
                } else if (setting.field[1] === "alignment") {
                  doc.qrSettings.pdf.paragraph2.alignment = setting.value;
                } else if (setting.field[1] === "fontColor") {
                  doc.qrSettings.pdf.paragraph2.fontColor = setting.value;
                } else if (setting.field[1] === "spaceAfter") {
                  doc.qrSettings.pdf.paragraph2.spaceAfter = setting.value;
                } else {
                  return reject({
                    error: {
                      id: 100029,
                      message: "Field is invalid.",
                    },
                  });
                }
              } else if (setting.field[0] === "paragraph3") {
                if (setting.field[1] === "text") {
                  doc.qrSettings.pdf.paragraph3.text = setting.value;
                } else if (setting.field[1] === "fontSize") {
                  doc.qrSettings.pdf.paragraph3.fontSize = setting.value;
                } else if (setting.field[1] === "alignment") {
                  doc.qrSettings.pdf.paragraph3.alignment = setting.value;
                } else if (setting.field[1] === "fontColor") {
                  doc.qrSettings.pdf.paragraph3.fontColor = setting.value;
                } else {
                  return reject({
                    error: {
                      id: 100030,
                      message: "Field is invalid.",
                    },
                  });
                }
              } else {
                return reject({
                  error: {
                    id: 100026,
                    message: "Field is invalid.",
                  },
                });
              }
            } else {
              return reject({
                error: {
                  id: 100025,
                  message: "Field is invalid.",
                },
              });
            }
          });

          doc
            .save()
            .then(() => {
              resolve(true);
            })
            .catch((err) => {
              console.error(err);
              reject({
                error: {
                  id: 100024,
                  message: "Something went wrong.",
                },
              });
            });
        } else {
          reject({
            error: {
              id: 100021,
              message: "Business does not exist.",
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: {
            id: 100020,
            message: "Something went wrong.",
          },
        });
      });
  });
};

/**
 * Adds a new visitor to the cloud.
 *
 * @param {String} businessLink
 * @param {String} visitorEmail
 * @param {String} visitorFirstName
 * @param {String} visitorLastName
 * @param {Date}   visitorBirthday
 */
module.exports.addVisitor = (
  businessLink,
  visitorEmail,
  visitorFirstName,
  visitorLastName,
  visitorBirthday
) => {
  const newVisitor = { email: visitorEmail };
  visitorFirstName && (newVisitor.firstName = visitorFirstName);
  visitorLastName && (newVisitor.lastName = visitorLastName);
  visitorBirthday && (newVisitor.birthday = visitorBirthday);

  return new Promise((resolve, reject) => {
    Business.updateOne(
      { link: businessLink },
      { $push: { visits: newVisitor } },
      (err, res) => {
        if (err) {
          reject({
            error: {
              id: 100031,
              message: "Something went wrong.",
            },
          });
        } else {
          if (res.nModified === 1) {
            Business.findOne({ link: businessLink }).then((doc) => {
              const submissionMessage = doc.profile.submissionMessage;
              resolve(submissionMessage);
            });
          } else {
            console.log(res);
            reject({
              error: {
                id: 100032,
                message:
                  "Business in invalid. Make sure you have spelled the business link correctly.",
              },
            });
          }
        }
      }
    );
  });
};
