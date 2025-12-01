import express from 'express';
import Message from '../models/Message.js';
import Animal from '../models/Animal.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get or create conversation
router.post('/conversation', authenticate, async (req, res) => {
  try {
    const { receiverId, animalId } = req.body;

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Create conversation ID (sorted to ensure uniqueness)
    const participants = [req.user._id.toString(), receiverId].sort();
    const conversationId = `${participants[0]}_${participants[1]}_${animalId}`;

    res.json({ conversationId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, animalId, message, conversationId } = req.body;

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    const participants = [req.user._id.toString(), receiverId].sort();
    const convId = conversationId || `${participants[0]}_${participants[1]}_${animalId}`;

    const newMessage = await Message.create({
      conversationId: convId,
      sender: req.user._id,
      receiver: receiverId,
      animal: animalId,
      message
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('animal', 'title images');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.conversationId 
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('animal', 'title images')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId: req.params.conversationId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('animal', 'title images')
      .sort({ createdAt: -1 });

    // Group by conversation
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const convId = msg.conversationId;
      if (!conversationsMap.has(convId)) {
        const otherUser = msg.sender._id.toString() === req.user._id.toString() 
          ? msg.receiver 
          : msg.sender;
        
        conversationsMap.set(convId, {
          conversationId: convId,
          otherUser,
          animal: msg.animal,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      const conv = conversationsMap.get(convId);
      if (msg.createdAt > conv.lastMessage.createdAt) {
        conv.lastMessage = msg;
      }
      if (!msg.isRead && msg.receiver._id.toString() === req.user._id.toString()) {
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


