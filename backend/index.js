require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const app = express();

// Import routes
const userRoutes = require("./routes/users");
const expenseRoutes = require("./routes/expenses");
const mealRoutes = require("./routes/meals");
const healthRoutes = require("./routes/health");
const gamificationRoutes = require("./routes/gamification");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins =
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL]
          : [
              "http://localhost:3000",
              "http://localhost:3001",
              "http://localhost:3002",
              "http://localhost:3003",
              "http://127.0.0.1:3000",
              "http://127.0.0.1:3001",
              "http://127.0.0.1:3002",
              "http://127.0.0.1:3003",
            ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
app.use(logger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Use the unified database connection from config/database.js
const connectDB = require("./config/database");

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Received shutdown signal, closing HTTP server...");
  server.close(() => {
    console.log("HTTP server closed");
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(
        `Database status: ${
          mongoose.connection.readyState === 1 ? "Connected" : "Not connected"
        }`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
