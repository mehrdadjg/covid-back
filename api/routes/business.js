const express = require("express");
const router = express.Router();

const {
  businessAddVisitor,
  businessGetQRCode,
  businessGetQRPdf,
  businessGetQRPdfSettings,
  businessGetVisitorCount,
  businessGetVerificationEmail,
  businessLogin,
  businessSaveProfile,
  businessSetQRPdfSettings,
  businessSignUp,
  businessSubmitVerificationCode,
} = require("../business");

require("../../authentication").configure();
const passport = require("passport");

/**
 * Routes to /signup within the business router.
 */
router.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  businessSignUp(email, password)
    .then(async (response) => {
      let verificationSentAt = null;
      try {
        verificationSentAt = await businessGetVerificationEmail(email);
      } catch (err) {
        verificationSentAt = null;
      }

      if (!response.business.emailVerificationSentAt && verificationSentAt) {
        response.business.emailVerificationSentAt = verificationSentAt;
      }

      res.status(201).json({
        ...response,
        code: 0,
      });
    })
    .catch((api_error) => {
      console.log({ api_error });
      res.status(405).json({
        ...api_error,
        code: 1,
      });
    });
});

/**
 * Routes to /login within the business router.
 */
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  businessLogin(email, password)
    .then((response) => {
      res.status(200).json({
        ...response,
        code: 0,
      });
    })
    .catch((api_error) => {
      console.log({ api_error });

      res.status(404).json({
        ...api_error,
        code: 1,
      });
    });
});

/**
 * Routes to /verify/get within the business router.
 */
router.get(
  "/verify/get",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    businessGetVerificationEmail(email)
      .then((verificationSentAt) => {
        res.status(200).json({
          code: 0,
          verificationSentAt: verificationSentAt,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });

        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /verify/submit within the business router.
 */
router.post(
  "/verify/submit",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;
    const verificationCode = req.body.verificationCode;

    businessSubmitVerificationCode(email, verificationCode)
      .then(() => {
        res.status(200).json({
          code: 0,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });

        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /profile within the business router.
 */
router.post(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;
    const profileValues = req.body.values;

    businessSaveProfile(email, profileValues)
      .then(() => {
        res.status(201).json({
          code: 0,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });

        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /getcode within the business router.
 */
router.get(
  "/getcode",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    businessGetQRCode(email)
      .then((qr) => {
        res.status(200).json({
          code: 0,
          qr: qr,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });

        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /downloadcode within the business router.
 */
router.get(
  "/downloadcode",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    businessGetQRCode(email, 500)
      .then((qr) => {
        res.status(200).setHeader("Content-Type", "image/svg+xml");
        res.end(qr);
      })
      .catch((api_error) => {
        console.log({ api_error });

        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /downloadpdf within the business router.
 */
router.get(
  "/downloadpdf",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    res.status(200).setHeader("Content-Type", "application/pdf");
    businessGetQRPdf(email, 500, res).catch((api_error) => {
      console.log({ api_error });
      res.status(406).json({
        ...api_error,
        code: 1,
      });
    });
  }
);

/**
 * Routes to /downloadpdf/settings within the business router.
 */
router.get(
  "/downloadpdf/settings",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    businessGetQRPdfSettings(email)
      .then((settings) => {
        res.status(200).json({
          settings,
          code: 0,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });
        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /downloadpdf/settings within the business router.
 */
router.post(
  "/downloadpdf/settings",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;
    const settingValues = req.body.values;

    businessSetQRPdfSettings(email, settingValues)
      .then(() => {
        res.status(200).json({
          code: 0,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });
        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

/**
 * Routes to /visits/add within the business router.
 */
router.post("/visits/add", (req, res) => {
  const businessLink = req.body.link;
  const visitorEmail = req.body.email;
  const visitorFname = req.body.fname;
  const visitorLname = req.body.lname;
  const visitorBirthday = req.body.birthday;

  businessAddVisitor(
    businessLink,
    visitorEmail,
    visitorFname,
    visitorLname,
    visitorBirthday
  )
    .then((submissionMessage) => {
      res.status(201).json({
        code: 0,
        submissionMessage,
      });
    })
    .catch((api_error) => {
      console.log({ api_error });
      res.status(406).json({
        ...api_error,
        code: 1,
      });
    });
});

/**
 * Routes to /visits/getcount within the business router.
 */
router.post(
  "/visits/getcount",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // provided by passport
    const email = req.body.business.email;

    const from = req.body.from;
    const to = req.body.to;

    businessGetVisitorCount(email, from, to)
      .then((count) => {
        res.status(201).json({
          code: 0,
          count,
        });
      })
      .catch((api_error) => {
        console.log({ api_error });
        res.status(406).json({
          ...api_error,
          code: 1,
        });
      });
  }
);

module.exports = router;
