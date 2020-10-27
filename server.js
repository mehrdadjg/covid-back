require("dotenv").config();
const httpPort = process.env.HTTP_PORT || 4005;

const http = require("http");

const app = require("./app");

const httpServer = http.createServer(app);

httpServer.listen(httpPort, () => {
  console.log(`Started the HTTP server on port ${httpPort}.`);
});
