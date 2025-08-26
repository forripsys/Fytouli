# 🌱 Fytouli Plant Care App

A comprehensive plant care application built with React, TypeScript, Express.js, and MongoDB. It helps you track your plants, monitor their watering and fertilizing schedules, and visualize tasks on a calendar.

## Features

-User Authentication
-Register, login, and manage your profile securely with JWT-based authentication.
-Plant Management
-Add, edit, and delete plants with details like species, location, soil type, pot size, light requirements, humidity, and temperature range.
-Upload an optional image and keep care notes.
-Quick actions for watering and fertilizing that automatically update schedules.
-Schedules
-Automatic task scheduling when plants are created or actions are performed.
-View upcoming and overdue tasks.
-Mark tasks complete with optional notes.
-Filter schedules by all, upcoming, overdue, and completed.
-Calendar view with hover tooltips for daily tasks.
-Dashboard
-Overview of total plants and their care status.
-Upcoming and overdue task highlights.


Interactive calendar with task completion support.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (see setup options below)

### Setup Options

#### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker Compose, which includes MongoDB:

```bash
# Clone the repository
git clone <repository-url>
cd plant_care

# Start all services with Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

#### Option 2: Local Development

1. **Install MongoDB locally**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install -y mongodb
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   
   # Windows
   # Download and install from https://www.mongodb.com/try/download/community
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/env.example backend/.env
   
   # Edit the .env file with your MongoDB connection string
   # MONGODB_URI=mongodb://localhost:27017/plant-care
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

#### Option 3: Cloud MongoDB

You can use MongoDB Atlas (free tier available):

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `backend/.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/plant-care
   ```

### Alternative: Run servers separately

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Usage

### Adding a Plant

1. Register/Login to create your account.

2. Add Plants with their details and care requirements.

3. View Dashboard to see plants, tasks, and calendar.

4. Complete Tasks directly from plant cards, the schedule list, or the calendar.

5. Edit/Delete Plants as needed.

## API Endpoints

## Auth
- `POST /register` → Create account
- `POST /login` → Login with email & password
- `GET /profile` → Get logged-in user info

### Plants
- `GET /api/plants` - Get all plants
- `GET /api/plants/:id` - Get plant by ID
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant
- `POST /api/plants/:id/water` - Mark plant as watered
- `POST /api/plants/:id/fertilize` - Mark plant as fertilized

### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/upcoming` - Get upcoming schedules
- `GET /api/schedules/overdue` - Get overdue schedules
- `GET /api/schedules/plant/:plantId` - Get schedules for specific plant
- `POST /api/schedules` - Create new schedule
- `GET /range?start=YYYY-MM-DD&end=YYYY-MM-DD` → Get schedules by date range
- `PUT /api/schedules/:id` - Update schedule
- `PUT /api/schedules/:id/complete` - Mark schedule as completed
- `DELETE /api/schedules/:id` - Delete schedule

## Project Structure

├── backend
│   ├── models/         # Mongoose schemas (User, Plant, Schedule)
│   ├── routes/         # Express routes (auth, plants, schedules)
│   └── middleware/     # Auth middleware
│
├── frontend
│   ├── components/     # Reusable UI components
│   ├── pages/          # Dashboard, Schedules, PlantDetail, Auth, etc.
│   ├── services/       # API wrapper (Axios)
│   └── types/          # TypeScript interfaces


## Development

### Available Scripts

**Root Directory:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for all packages

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Schema

**Plant Model:**
- Basic info (name, species, location, pot size, soil type)
- Care requirements (light, humidity, temperature range)
- Care schedule (watering/fertilizing frequency)
- Last care dates
- Notes and optional image URL

**Schedule Model:**
- Plant reference
- Task type (watering/fertilizing)
- Scheduled date
- Completion status
- Notes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 