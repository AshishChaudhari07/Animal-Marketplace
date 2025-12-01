import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import AnimalCard from '../components/AnimalCard';
import apiClient from '../apiClient';

const SavedItems = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to view saved items');
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch reviews for wishlist items
  useEffect(() => {
    if (wishlist.length > 0) {
      fetchReviews();
    }
  }, [wishlist]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsMap = {};
      
      await Promise.all(
        wishlist.map(async (animal) => {
          try {
            const reviewsRes = await apiClient.get(`/api/reviews/animal/${animal._id}`);
            if (reviewsRes.data && reviewsRes.data.length > 0) {
              const avgRating =
                reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length;
              reviewsMap[animal._id] = {
                avgRating,
                count: reviewsRes.data.length
              };
            } else {
              reviewsMap[animal._id] = { avgRating: 0, count: 0 };
            }
          } catch (error) {
            reviewsMap[animal._id] = { avgRating: 0, count: 0 };
          }
        })
      );
      
      setReviews(reviewsMap);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="font-medium">Go Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaHeart className="text-red-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Saved Items</h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length} animal{wishlist.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {wishlistLoading || loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Saved Items Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring and save your favorite animals to view them later.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Animals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((animal) => (
              <AnimalCard
                key={animal._id}
                animal={animal}
                avgRating={reviews[animal._id]?.avgRating || 0}
                reviewCount={reviews[animal._id]?.count || 0}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {wishlist.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Wishlist Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-blue-600">{wishlist.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">For Sale</p>
                <p className="text-2xl font-bold text-green-600">
                  {wishlist.filter(a => a.category === 'sale').length}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">For Adoption</p>
                <p className="text-2xl font-bold text-purple-600">
                  {wishlist.filter(a => a.category === 'adoption').length}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{Math.round(wishlist.reduce((sum, a) => sum + a.price, 0) / wishlist.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedItems;
