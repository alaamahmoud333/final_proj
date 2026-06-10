import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config({ path: './config/dev.env' });

let mongoServer;

const seedMockData = async () => {
  try {
    const User = (await import('../models/user.js')).default;
    const bcrypt = (await import('bcrypt')).default;
    
    const mockUsers = [
      {
        name: 'Ahmed Ali',
        username: 'ahmed123',
        email: 'ahmed@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Software Engineer from Egypt.',
      },
      {
        name: 'Sara Kamel',
        username: 'sara_k',
        email: 'sara@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?img=5',
        bio: 'UI/UX Designer. Coffee lover.',
      },
      {
        name: 'Mohamed Tarek',
        username: 'mo_tarek',
        email: 'mohamed@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?img=12',
        bio: 'Tech enthusiast and developer.',
      }
    ];

    for (let userData of mockUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        await User.create({
          ...userData,
          password: hashedPassword
        });
        console.log(`Created in-memory user: ${userData.name}`);
      }
    }
    console.log('In-memory database seeding completed.');
  } catch (err) {
    console.error('Error seeding in-memory database:', err);
  }
};

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || process.env.DB_URL;
  try {
    console.log('Attempting to connect to remote MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully to remote Atlas');
  } catch (error) {
    console.warn('Remote MongoDB connection failed:', error.message);
    console.log('Starting local in-memory MongoDB server as fallback...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      await mongoose.connect(localUri);
      console.log('Connected successfully to local in-memory MongoDB at:', localUri);
      
      // Seed mock data
      await seedMockData();
    } catch (localError) {
      console.error('Failed to start local in-memory MongoDB:', localError.message);
      process.exit(1);
    }
  }
};

export default connectDB;