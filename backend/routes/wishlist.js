import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyer: req.user._id })
      .populate('animals');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ buyer: req.user._id, animals: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add animal to wishlist
router.post('/add/:animalId', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyer: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        buyer: req.user._id, 
        animals: [req.params.animalId] 
      });
    } else if (!wishlist.animals.includes(req.params.animalId)) {
      wishlist.animals.push(req.params.animalId);
      await wishlist.save();
    }
    
    await wishlist.populate('animals');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove animal from wishlist
router.post('/remove/:animalId', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user._id });
    
    if (wishlist) {
      wishlist.animals = wishlist.animals.filter(
        id => id.toString() !== req.params.animalId
      );
      await wishlist.save();
      await wishlist.populate('animals');
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if animal is in wishlist
router.get('/check/:animalId', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user._id });
    const isInWishlist = wishlist && wishlist.animals.includes(req.params.animalId);
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
