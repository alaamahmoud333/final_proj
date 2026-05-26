import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import connectDB from './db/connection.js';

dotenv.config();
dotenv.config({ path: 'config/dev.env' }); // load correct env

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

const seedUsers = async () => {
  try {
    await connectDB();
    
    for (let userData of mockUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        await User.create({
          ...userData,
          password: hashedPassword
        });
        console.log(`Created user: ${userData.name}`);
      } else {
        console.log(`User already exists: ${userData.name}`);
      }
    }
    
    console.log('Database seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
