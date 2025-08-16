const fs = require("fs");
const path = require("path");

// Function to update .env file with new MongoDB credentials
function updateEnvFile() {
  const envPath = path.join(__dirname, ".env");

  // New MongoDB URI with proper credentials
  const newMongoURI =
    "MONGODB_URI=mongodb+srv://qopchiq_user:qopchiq_password_2024@cluster0.ygt5asc.mongodb.net/qopchiq?retryWrites=true&w=majority";

  // Other environment variables
  const otherVars = [
    "NODE_ENV=development",
    "PORT=5000",
    "JWT_SECRET=qopchiq-jwt-secret-key-2024-development",
    "JWT_EXPIRE=30d",
    "FRONTEND_URL=http://localhost:3000",
  ];

  // Combine all environment variables
  const envContent = [newMongoURI, ...otherVars].join("\n");

  try {
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated successfully!");
    console.log("New MongoDB URI:", newMongoURI);
    console.log("");
    console.log("Now restart your server with: npm run dev");
  } catch (error) {
    console.error("❌ Error updating .env file:", error.message);
  }
}

// Function to test the new connection
async function testNewConnection() {
  const mongoose = require("mongoose");
  require("dotenv").config();

  console.log("Testing new MongoDB connection...");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connection successful!");
    await mongoose.disconnect();
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error.message);
    console.log("");
    console.log("Make sure you have:");
    console.log("1. Created the new user in MongoDB Atlas");
    console.log("2. Set the correct username and password");
    console.log("3. Allowed network access from your IP");
  }
}

// Run the update
updateEnvFile();

// Test the connection if mongoose is available
try {
  testNewConnection();
} catch (error) {
  console.log("Skipping connection test (mongoose not available)");
}
