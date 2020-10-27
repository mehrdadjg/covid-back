const jwt = require("jsonwebtoken");
const fs = require("fs");
const join = require("path").join;

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const Business = require("../database/models/business");

module.exports.sign = (payload) => {
  const key = fs.readFileSync(join(__dirname + "/secret.key"), "ascii");

  const token = jwt.sign(payload, key, {
    algorithm: "HS512",
    issuer: process.env.JWT_ISSUER,
  });

  return token;
};

module.exports.configure = () => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = fs.readFileSync(join(__dirname + "/secret.key"), "ascii");
  opts.issuer = process.env.JWT_ISSUER;
  opts.passReqToCallback = true;

  /**
   * If valid, it appends the business to request.body.
   */
  passport.use(
    new JwtStrategy(opts, (request, payload, done) => {
      Business.findOne({ email: payload.email })
        .then((doc) => {
          if (doc == null) {
            return done(new Error("Business not found."), false);
          }

          request.body.business = {
            email: doc.email,
          };
          return done(null, doc);
        })
        .catch((db_err) => {
          return done(db_err, false);
        });
    })
  );
};
