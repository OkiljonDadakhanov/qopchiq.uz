# Qopchiq.uz - Financial & Health Tracking Application

A comprehensive financial and health tracking application built with Next.js frontend and Node.js backend, featuring Telegram integration and gamification elements.

## 🚀 Features

- **Financial Tracking**: Track expenses, set budgets, and analyze spending patterns
- **Health Monitoring**: Log meals, track calories, monitor water intake, and calculate BMI
- **Telegram Integration**: Seamless authentication through Telegram Web App
- **Gamification**: Earn coins, level up, and unlock badges for healthy habits
- **Multi-language Support**: Uzbek and English interfaces
- **Real-time Analytics**: Comprehensive insights into your financial and health data
- **Responsive Design**: Mobile-first design optimized for all devices

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Node.js/Express API with MongoDB database
- **Authentication**: JWT-based authentication with Telegram integration
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Context API with custom hooks

## 📁 Project Structure

```
qopchiq.uz/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and app configuration
│   ├── controllers/        # API route controllers
│   ├── middleware/         # Authentication and validation middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper functions and utilities
│   └── index.js            # Main server file
├── frontend/               # Next.js application
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client and utilities
│   └── styles/             # Global styles and Tailwind config
└── README.md               # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or pnpm

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/qopchiq
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB** (make sure MongoDB is running on your system)

5. **Start the backend server:**

   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create environment file:**

   ```bash
   # The .env.local file is already created with:
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🔐 Authentication

The application uses Telegram Web App for authentication:

1. **Telegram Integration**: Users can log in directly through Telegram
2. **JWT Tokens**: Secure authentication with automatic token refresh
3. **Manual Login**: Fallback option for users without Telegram
4. **Protected Routes**: Automatic redirection for unauthenticated users

## 📱 Telegram Web App

To use the Telegram integration:

1. Create a Telegram bot using [@BotFather](https://t.me/botfather)
2. Set up your bot's Web App URL to point to your deployed frontend
3. Users can access the app directly from Telegram

## 🗄️ Database Schema

### Users

- Telegram ID, username, name, language preferences
- Financial limits, current balance, level, coins, streak
- Badges and achievements

### Expenses

- Amount, category, description, emoji, date
- Mood tracking, location, payment method
- Tags and currency support

### Meals

- Name, calories, category, meal type
- Nutritional information, ingredients
- Rating and cost tracking

### Health Metrics

- BMI calculations, exercise logs
- Water intake tracking
- Health score progression

## 🎮 Gamification System

- **Coins**: Earn coins for completing tasks
- **Levels**: Progress through levels based on activity
- **Streaks**: Maintain daily activity streaks
- **Badges**: Unlock achievements for milestones
- **Challenges**: Participate in time-limited challenges

## 🌐 API Endpoints

The backend provides comprehensive REST API endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Expenses**: `/api/expenses/*`
- **Meals**: `/api/meals/*`
- **Health**: `/api/health/*`
- **Gamification**: `/api/gamification/*`
- **Analytics**: `/api/analytics/*`

## 🚀 Deployment

### Backend Deployment

1. Set environment variables for production
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas or production MongoDB instance
4. Configure CORS for your production domain

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting
3. Update environment variables for production
4. Configure Telegram Web App URL

## 🔧 Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Future Enhancements

- [ ] Push notifications
- [ ] Advanced analytics and insights
- [ ] Social features and sharing
- [ ] Integration with financial institutions
- [ ] AI-powered recommendations
- [ ] Mobile app development

---

**Built with ❤️ for the Uzbekistan community**
