# MongoDB Atlas Setup Guide

## Current Issue

The MongoDB Atlas connection is failing with "bad auth : authentication failed" error.

## Solutions

### Option 1: Create a new MongoDB Atlas user

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Select your cluster (cluster0.ygt5asc.mongodb.net)
4. Go to "Database Access" in the left sidebar
5. Click "Add New Database User"
6. Choose "Password" authentication
7. Set username: `qopchiq_user`
8. Set password: `qopchiq_password_2024`
9. Select "Read and write to any database"
10. Click "Add User"

Then update your .env file:

```
MONGODB_URI=mongodb+srv://qopchiq_user:qopchiq_password_2024@cluster0.ygt5asc.mongodb.net/qopchiq?retryWrites=true&w=majority
```

### Option 2: Use MongoDB Atlas with Network Access

1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Or add your specific IP address

### Option 3: Use a different MongoDB service

You can use MongoDB Atlas with a free tier or try other services like:

- MongoDB Atlas (free tier)
- Railway.app (MongoDB)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)

### Option 4: Local MongoDB (for development)

Install MongoDB locally:

1. Download MongoDB Community Server
2. Install and start the service
3. Use connection string: `mongodb://localhost:27017/qopchiq`

## Current Status

The application is currently running in mock mode (without database) to allow testing of the frontend functionality.
