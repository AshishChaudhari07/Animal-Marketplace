import express from 'express';
import Animal from '../models/Animal.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get pending animals
router.get('/animals/pending', async (req, res) => {
  try {
    const animals = await Animal.find({ status: 'pending' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve animal
router.put('/animals/:id/approve', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('seller', 'name email');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject animal
router.put('/animals/:id/reject', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('seller', 'name email');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    const updateData = {};

    if (role) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });

    const totalAnimals = await Animal.countDocuments();
    const pendingAnimals = await Animal.countDocuments({ status: 'pending' });
    const approvedAnimals = await Animal.countDocuments({ status: 'approved' });
    const soldAnimals = await Animal.countDocuments({ status: 'sold' });

    const totalReviews = await Review.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Animals by species
    const animalsBySpecies = await Animal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Animals by category
    const animalsByCategory = await Animal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Monthly new users (last 12 months)
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          count: 1
        }
      },
      { $limit: 12 }
    ]);

    // Monthly new animals (last 12 months)
    const monthlyAnimals = await Animal.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          count: 1
        }
      },
      { $limit: 12 }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
        recent: recentUsers
      },
      animals: {
        total: totalAnimals,
        pending: pendingAnimals,
        approved: approvedAnimals,
        sold: soldAnimals
      },
      reviews: totalReviews,
      messages: totalMessages,
      animalsBySpecies,
      categories: animalsByCategory,
      monthlyUsers,
      monthlyAnimals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


