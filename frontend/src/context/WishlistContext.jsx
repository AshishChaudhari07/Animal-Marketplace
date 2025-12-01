import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist');
      setWishlist(response.data.animals || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (animalId) => {
    if (!user) return false;
    try {
      const response = await axios.post(`/api/wishlist/add/${animalId}`);
      setWishlist(response.data.animals || []);
      return true;
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (animalId) => {
    if (!user) return false;
    try {
      const response = await axios.post(`/api/wishlist/remove/${animalId}`);
      setWishlist(response.data.animals || []);
      return true;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (animalId) => {
    return wishlist.some(animal => animal._id === animalId);
  };

  const toggleWishlist = async (animalId) => {
    if (!user) return false;
    if (isInWishlist(animalId)) {
      return removeFromWishlist(animalId);
    } else {
      return addToWishlist(animalId);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      toggleWishlist,
      fetchWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
