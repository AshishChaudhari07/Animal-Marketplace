// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import animalRoutes from './routes/animals.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import wishlistRoutes from './routes/wishlist.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animal', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize admin user
    initializeAdmin();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.error('Make sure your IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  });

// Initialize admin user
async function initializeAdmin() {
  try {
    const User = (await import('./models/User.js')).default;
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not set in .env file');
      return;
    }
    
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      // Don't hash here - let the User schema pre('save') middleware handle it
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created successfully');
    } else {
      // Update admin password if it doesn't match (in case password was changed in .env)
      const isMatch = await adminExists.comparePassword(adminPassword);
      if (!isMatch) {
        adminExists.password = adminPassword;
        await adminExists.save();
        console.log('Admin password updated');
      }
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

