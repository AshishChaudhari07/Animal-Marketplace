import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_NAME || 
          process.env.CLOUDINARY_NAME === 'ABC' ||
          !process.env.CLOUDINARY_API_KEY ||
          process.env.CLOUDINARY_API_KEY === 'ABC') {
        // Use placeholder avatar for development
        updateData.avatar = 'https://via.placeholder.com/200';
        console.log('Using placeholder avatar (Cloudinary not configured)');
      } else {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          updateData.avatar = result.secure_url;
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError);
          return res.status(500).json({ 
            message: 'Avatar upload failed. Please check Cloudinary configuration.',
            error: cloudinaryError.message 
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller profile with stats
router.get('/seller/:id/stats', async (req, res) => {
  try {
    const Animal = (await import('../models/Animal.js')).default;
    const Review = (await import('../models/Review.js')).default;

    const seller = await User.findById(req.params.id).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const totalListings = await Animal.countDocuments({ seller: req.params.id });
    const activeListings = await Animal.countDocuments({ 
      seller: req.params.id, 
      status: 'approved',
      isAvailable: true 
    });
    const soldCount = await Animal.countDocuments({ 
      seller: req.params.id, 
      status: 'sold' 
    });

    const reviews = await Review.find({ seller: req.params.id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      seller,
      stats: {
        totalListings,
        activeListings,
        soldCount,
        totalReviews: reviews.length,
        avgRating: avgRating.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

