import express from 'express';
import Animal from '../models/Animal.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get all approved animals (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      species,
      breed,
      gender,
      minPrice,
      maxPrice,
      city,
      state,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      status: 'approved',
      isAvailable: true
    };

    if (species) query.species = new RegExp(species, 'i');
    if (breed) query.breed = new RegExp(breed, 'i');
    if (gender) query.gender = gender;
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // Fix search to work with regex instead of text search
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { species: new RegExp(search, 'i') },
        { breed: new RegExp(search, 'i') }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const animals = await Animal.find(query)
      .populate('seller', 'name email phone city state')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Animal.countDocuments(query);

    res.json({
      animals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single animal
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('seller', 'name email phone city state address zipCode avatar');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Increment views
    animal.views += 1;
    await animal.save();

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create animal (seller only)
router.post('/', authenticate, authorize('seller', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      species,
      breed,
      age,
      gender,
      price,
      healthStatus,
      city,
      state,
      zipCode,
      category
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images to Cloudinary
    let images = [];
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_NAME || 
        process.env.CLOUDINARY_NAME === 'ABC' ||
        !process.env.CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_KEY === 'ABC') {
      // Use placeholder images for development
      images = req.files.map(() => 'https://via.placeholder.com/500');
      console.log('Using placeholder images (Cloudinary not configured)');
    } else {
      try {
        const imageUploads = await Promise.all(
          req.files.map(file => uploadToCloudinary(file.buffer))
        );
        images = imageUploads.map(result => result.secure_url);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ 
          message: 'Image upload failed. Please check Cloudinary configuration.',
          error: cloudinaryError.message 
        });
      }
    }

    const animal = await Animal.create({
      seller: req.user._id,
      title,
      description,
      species,
      breed,
      age: Number(age),
      gender,
      price: Number(price),
      healthStatus: healthStatus || 'good',
      location: { city, state, zipCode },
      images,
      category: category || 'sale',
      status: 'approved' // Auto-approve all listings so buyers can see them immediately
    });

    const populatedAnimal = await Animal.findById(animal._id)
      .populate('seller', 'name email phone');

    res.status(201).json(populatedAnimal);
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create animal',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update animal (seller own or admin)
router.put('/:id', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Check if user is seller or admin
    if (animal.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    // Handle images
    if (req.files && req.files.length > 0) {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_NAME || 
          process.env.CLOUDINARY_NAME === 'ABC' ||
          !process.env.CLOUDINARY_API_KEY ||
          process.env.CLOUDINARY_API_KEY === 'ABC') {
        // Use placeholder images for development
        updateData.images = req.files.map(() => 'https://via.placeholder.com/500');
        console.log('Using placeholder images (Cloudinary not configured)');
      } else {
        try {
          const imageUploads = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer))
          );
          updateData.images = imageUploads.map(result => result.secure_url);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError);
          return res.status(500).json({ 
            message: 'Image upload failed. Please check Cloudinary configuration.',
            error: cloudinaryError.message 
          });
        }
      }
    }

    // Convert numeric fields
    if (updateData.age) updateData.age = Number(updateData.age);
    if (updateData.price) updateData.price = Number(updateData.price);

    // Handle location
    if (updateData.city || updateData.state || updateData.zipCode) {
      updateData.location = {
        city: updateData.city || animal.location.city,
        state: updateData.state || animal.location.state,
        zipCode: updateData.zipCode || animal.location.zipCode
      };
      delete updateData.city;
      delete updateData.state;
      delete updateData.zipCode;
    }

    // If admin updates, can change status
    if (req.user.role === 'admin' && updateData.status) {
      updateData.status = updateData.status;
    } else if (animal.seller.toString() === req.user._id.toString()) {
      // If seller updates, keep status as approved (don't reset to pending)
      if (!updateData.status) {
        updateData.status = animal.status || 'approved';
      }
    }

    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'name email phone');

    res.json(updatedAnimal);
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update animal',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete animal (seller own or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Animal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's animals
router.get('/seller/my-animals', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const animals = await Animal.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

