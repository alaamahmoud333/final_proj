# Full Backend-Frontend Integration Guide

## Project Structure
This is a full-stack social media application with:
- **Backend**: Express.js + MongoDB
- **Frontend**: React + Redux + TailwindCSS
- **Authentication**: JWT-based
- **API**: RESTful endpoints

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend folder:
```
JWT_SECRET=your-secret-key-here
MONGO_URI=mongodb://127.0.0.1:27017/gradproj
PORT=5000
```

### 3. Ensure MongoDB is Running
Make sure MongoDB is running on `localhost:27017`

### 4. Start the Backend Server
```bash
npm start
```
The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd front-end/frontend
npm install
```

### 2. Environment Configuration
The `.env` file is already configured with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend
```bash
npm start
```
The app will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `POST /api/posts` - Create a new post (protected)
- `GET /api/posts` - Get all posts (protected)
- `PUT /api/posts/:id/like` - Like/Unlike a post (protected)

### Users
- `GET /api/users/:id` - Get user profile (protected)
- `PUT /api/users/:id/follow` - Follow/Unfollow user (protected)

## Full Integration Features

✅ **User Authentication**
- Register with username, email, password
- Login with email and password
- JWT token stored in localStorage
- Automatic logout functionality

✅ **Post Management**
- Create posts with text content
- View all posts in feed
- Like/unlike posts
- See post interactions (comments, reposts, likes)

✅ **User Profiles**
- View user information
- Follow/unfollow users
- Display user avatar and bio

✅ **Real-time UI Updates**
- Posts feed updates after creating new post
- Like count updates immediately
- Loading states during API calls
- Error handling and user feedback

## Database Models

### User Schema
- username (unique)
- email (unique)
- password (hashed)
- profilePic
- bio
- followers (array of user IDs)
- following (array of user IDs)
- timestamps

### Post Schema
- user (reference to User)
- content
- image (optional)
- likes (array of user IDs)
- comments (array of comment objects)
- reposts (array of user IDs)
- timestamps

### Comment Schema
- user (reference to User)
- post (reference to Post)
- text
- likes (array of user IDs)
- timestamps

### Notification Schema
- recipient (reference to User)
- sender (reference to User)
- type (like, comment, follow, mention)
- post (reference to Post, optional)
- read (boolean)
- timestamps

## Testing the Integration

1. **Create Account**: Register a new account
2. **Login**: Use your credentials to login
3. **Create Post**: Write a post in the feed
4. **View Posts**: See posts from all users
5. **Like Posts**: Click heart icon to like/unlike
6. **View Profile**: Check your profile in sidebar

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists with correct values
- Check port 5000 is not in use

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `.env` file has correct API_URL
- Check browser console for CORS errors

### Login not working
- Verify credentials match registration
- Check token is being stored in localStorage
- Check browser console for error messages

### MongoDB connection error
- Start MongoDB service
- Verify connection string in `.env`
- Check database name is correct

## Key Files

**Backend:**
- `server.js` - Main server entry point
- `controllers/` - Business logic
- `models/` - Database schemas
- `routes/` - API endpoints
- `middleware/` - Authentication & validation

**Frontend:**
- `src/App.jsx` - Main app component
- `src/pages/` - Page components (Login, Register, Home)
- `src/layout/MainLayout.jsx` - Main feed layout
- `src/components/` - Reusable components
- `src/services/api.js` - API calls
- `src/redux/` - State management

## Next Steps

1. Implement comment functionality
2. Add real-time notifications
3. Add search functionality
4. Implement user discovery
5. Add media upload for posts
6. Add dark mode toggle
7. Add responsive design refinements
