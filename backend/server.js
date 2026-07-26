require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDB } = require("./config/db");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, _res, next) => {
  const timestamp = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log(`[${req.method}] ${req.path} - ${timestamp}`);
  next();
});

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "The Professional Standard API is running",
    sprint: "Sprint 11 - The Professional Standard",
    track: "Track B - Fullstack Developers",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
    endpoints: {
      posts: "/posts",
      topRecentPosts: "/posts/top/recent",
      users: "/users",
      login: "/login",
    },
  });
});

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.post("/login", (req, res) => {
  const { username, email, password } = req.body || {};
  const loginName = username || email;

  if (!loginName || !password) {
    return res.status(400).json({
      message: "Username/email and password are required",
    });
  }

  const mockTokenPayload = Buffer.from(
    JSON.stringify({
      sub: loginName,
      role: "intern",
      issuedAt: new Date().toISOString(),
    }),
  ).toString("base64url");

  return res.json({
    message: "Login successful",
    token: `mock.jwt.${mockTokenPayload}`,
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON body",
    });
  }

  console.error(err);
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Professional Standard API is running on port ${PORT}`);
  });
};

startServer();
