import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_attention'],
    default: 'good'
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String
    }
  },
  images: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'adopted'],
    default: 'pending'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['sale', 'adoption'],
    default: 'sale'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
animalSchema.index({ title: 'text', description: 'text', species: 'text', breed: 'text' });
animalSchema.index({ status: 1, isAvailable: 1 });

export default mongoose.model('Animal', animalSchema);


