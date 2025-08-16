require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI environment variable is not set");
      console.log("MongoDB URI:", process.env.MONGODB_URI);
      console.log("Starting server without database connection...");
      return null;
    }

    // Connection options for production optimization
    // const options = {
    //   maxPoolSize: 10, // Maintain up to 10 socket connections
    //   serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    //   // bufferCommands: false, // Disable mongoose buffering
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // };

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true, // Changed to true to allow operations when not connected
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Mongoose connection closed due to application termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    console.log("Starting server without database connection...");
    console.log("Some features may not work properly without MongoDB");
    return null;
  }
};

module.exports = connectDB;
