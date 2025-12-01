import express from 'express';
import Review from '../models/Review.js';
import Animal from '../models/Animal.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create review
router.post('/', authenticate, async (req, res) => {
  try {
    const { sellerId, animalId, rating, comment } = req.body;

    // Validate required fields
    if (!sellerId || !animalId || !rating) {
      return res.status(400).json({ message: 'Seller ID, Animal ID, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Allow reviews for approved, sold, or adopted animals
    // In a marketplace, buyers can review after purchase/adoption
    if (animal.status !== 'approved' && animal.status !== 'sold' && animal.status !== 'adopted') {
      return res.status(400).json({ message: 'Can only review approved, sold, or adopted animals' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      buyer: req.user._id,
      animal: animalId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this animal' });
    }

    const review = await Review.create({
      buyer: req.user._id,
      seller: sellerId,
      animal: animalId,
      rating,
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('buyer', 'name avatar')
      .populate('animal', 'title');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('buyer', 'name avatar')
      .populate('animal', 'title images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for an animal
router.get('/animal/:animalId', async (req, res) => {
  try {
    const reviews = await Review.find({ animal: req.params.animalId })
      .populate('buyer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

