// Ensure dotenv is loaded first
import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary - ensure it's called after env vars are loaded
const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  };
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Cloudinary config:', {
      cloud_name: config.cloud_name ? '✓' : '✗',
      api_key: config.api_key ? '✓' : '✗',
      api_secret: config.api_secret ? '✓' : '✗'
    });
  }
  
  cloudinary.config(config);
};

// Configure immediately
configureCloudinary();

const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    // Re-configure to ensure latest env vars are used
    configureCloudinary();
    
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_NAME || 
        process.env.CLOUDINARY_NAME === 'ABC' ||
        !process.env.CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_KEY === 'ABC') {
      reject(new Error('Cloudinary not configured'));
      return;
    }

    // Verify Cloudinary config is valid
    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key) {
      console.error('Cloudinary configuration missing:', {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? 'present' : 'missing'
      });
      reject(new Error('Cloudinary configuration is invalid'));
      return;
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'animal-marketplace',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      if (!buffer || buffer.length === 0) {
        reject(new Error('Empty buffer provided'));
        return;
      }
      
      const stream = Readable.from(buffer);
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
      stream.pipe(uploadStream);
    } catch (error) {
      console.error('Error creating upload stream:', error);
      reject(error);
    }
  });
};

export default cloudinary;

