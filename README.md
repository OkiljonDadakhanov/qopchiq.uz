# Qopchiq.uz - Personal Finance & Health Tracker

A comprehensive personal finance and health tracking application built with Next.js, Node.js, and MongoDB.

## 🚀 Features

### ✅ Working Features

#### 💰 Expense Management

- **Add Expenses**: Track daily expenses with categories, amounts, descriptions, and emojis
- **Expense Categories**: Food, Transport, Shopping, Entertainment, Bills, Health, Education, Travel, Gifts, Other
- **Mood Tracking**: Log your mood when adding expenses (Happy, Neutral, Sad, Stressed)
- **Location Tracking**: Add location information to expenses
- **Balance Management**: Automatic balance updates when expenses are added
- **Monthly Limits**: Set and track monthly spending limits
- **Expense Analytics**: View spending patterns and category breakdowns

#### 🍽️ Meal & Nutrition Tracking

- **Add Meals**: Log meals with calories, categories, and meal types
- **Uzbek Food Database**: Pre-loaded with popular Uzbek dishes (Osh, Somsa, Shashlik, etc.)
- **Meal Categories**: Protein, Carbs, Veggies, Sweets
- **Meal Types**: Breakfast, Lunch, Dinner, Snack
- **Calorie Tracking**: Monitor daily calorie intake
- **Nutrition Analytics**: View meal patterns and nutrition insights

#### 🎮 Gamification System

- **Coins System**: Earn coins for tracking expenses and meals
- **Level Progression**: Level up based on coins earned
- **Streaks**: Maintain daily tracking streaks
- **Badges**: Earn achievements for various milestones
- **Leaderboards**: Compare with other users

#### 📊 Analytics & Insights

- **Financial Overview**: Total expenses, income, savings, and budget analysis
- **Spending Analytics**: Category breakdown, monthly spending trends
- **Health Analytics**: BMI tracking, water intake, exercise logging
- **Personalized Insights**: AI-powered recommendations and insights

#### 🏥 Health Tracking

- **BMI Calculator**: Track height, weight, and calculate BMI
- **Water Intake**: Log daily water consumption
- **Exercise Logging**: Track workouts and calories burned
- **Health Metrics**: Monitor various health indicators

#### 🔔 Smart Features

- **Bill Reminders**: Never miss important payments
- **Daily Tips**: Personalized financial and health tips
- **Currency Converter**: Convert between different currencies
- **Data Export**: Export your data for backup or analysis

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- MongoDB (optional - app works with demo mode)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd qopchiq.uz
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the development servers**

   **Option 1: Using the provided scripts**

   ```bash
   # Windows (PowerShell)
   .\start-dev.ps1

   # Windows (Command Prompt)
   start-dev.bat
   ```

   **Option 2: Manual start**

   ```bash
   # Terminal 1 - Start Backend
   cd backend
   npm start

   # Terminal 2 - Start Frontend
   cd frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🎯 Demo Access

The application includes a demo mode that works without a database connection:

**Login Credentials:**

- Email: `demo@qopchiq.uz`
- Password: `demo123`

## 📱 How to Use

### 1. Getting Started

1. Open http://localhost:3000
2. Login with demo credentials
3. Explore the dashboard

### 2. Adding Expenses

1. Click "Add Expense" button
2. Enter amount, select category, add description
3. Optionally add mood and location
4. Click "Add" to save

### 3. Logging Meals

1. Click "Add Meal" button
2. Choose from Uzbek foods or add custom meal
3. Enter calories and select category
4. Click "Add" to save

### 4. Viewing Analytics

1. Navigate to the Analytics tab
2. View spending patterns, health metrics
3. Get personalized insights and recommendations

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qopchiq
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
qopchiq.uz/
├── backend/
│   ├── controllers/     # API controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── frontend/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   └── types/         # TypeScript types
└── README.md
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Multi-language Support**: Uzbek and English
- **Modern UI**: Clean, intuitive interface
- **Real-time Updates**: Instant feedback on actions
- **Loading States**: Smooth user experience

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling
- **Helmet.js**: Security headers

## 📊 Data Management

- **Real-time Sync**: Data updates immediately
- **Offline Support**: Works without internet (demo mode)
- **Data Export**: Export your data
- **Backup & Restore**: Data persistence options

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify both servers are running
3. Check the health endpoint: http://localhost:5000/health
4. Try the demo login first

## 🎉 What's Working Now

✅ **Fully Functional Features:**

- User authentication (demo mode)
- Expense tracking and management
- Meal logging and nutrition tracking
- Real-time dashboard updates
- Analytics and insights
- Gamification system
- Responsive UI
- API integration

✅ **Ready for Production:**

- Complete frontend-backend integration
- Error handling and validation
- Security measures
- Performance optimization
- Mobile-responsive design

The application is now fully functional and ready for use! All core features are working with proper backend integration and database connectivity (with fallback to demo mode).
