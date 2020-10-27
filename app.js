const express = require("express");
const app = express();

const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const businessRoutes = require("./api/routes/business");

const { connect } = require("./database");

// Connecting to the database
connect();

// Setting up middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setting up routes
app.use("/business", businessRoutes);

// Setting up unexistent routes
app.use((req, res, next) => {
  const err = new Error("Page not found!");
  err.status = 404;

  next(err);
});

// Setting up error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;
