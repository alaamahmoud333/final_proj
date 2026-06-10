import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import postRoutes from './routes/postroutes.js';
import userRoutes from './routes/userroutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import connectDB from './db/connection.js';

dotenv.config();
dotenv.config({ path: './config/dev.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
