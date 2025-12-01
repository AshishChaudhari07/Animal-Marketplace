import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Wishlist', wishlistSchema);
