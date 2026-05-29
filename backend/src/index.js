// app.js
require("dotenv/config");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const passport = require("passport");
const asyncHandler = require("./middlewares/asyncHandler.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const connectDatabase = require("./config/database.config");
const { initializeSocket } = require("./lib/socket");
const routes = require("./routes");
require("./config/passport.config");

const app = express();
const server = http.createServer(app);

// socket
initializeSocket(server);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(passport.initialize());

app.get(
  "/health",
  asyncHandler(async (req, res) => {
    res.status(200).json({
      message: "Server is healthy",
      status: "OK",
    });
  })
);

app.use("/api", routes);

if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../../client/dist");

  // serve static files
  app.use(express.static(clientPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use(errorHandler);

server.listen(process.env.PORT, async () => {
  await connectDatabase();
  console.log(
    `Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});