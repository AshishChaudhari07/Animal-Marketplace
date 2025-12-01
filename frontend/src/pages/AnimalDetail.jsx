import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { FaPaw, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import AnimalCard from '../components/AnimalCard';

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [animal, setAnimal] = useState(null);
  const [relatedAnimals, setRelatedAnimals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [relatedReviews, setRelatedReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    fetchAnimal();
    fetchReviews();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const response = await apiClient.get(`/api/animals/${id}`);
      setAnimal(response.data);
      fetchRelatedAnimals(response.data);
    } catch (error) {
      toast.error('Failed to load animal details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedAnimals = async (currentAnimal) => {
    try {
      const response = await apiClient.get('/api/animals', {
        params: {
          species: currentAnimal.species,
          state: currentAnimal.location.state,
          limit: 4,
          page: 1
        }
      });

      const filtered = response.data.animals.filter(a => a._id !== currentAnimal._id).slice(0, 4);
      setRelatedAnimals(filtered);

      // Fetch reviews for related animals
      const reviewsMap = {};
      await Promise.all(
        filtered.map(async (animal) => {
          try {
            const reviewsRes = await apiClient.get(`/api/reviews/animal/${animal._id}`);
            if (reviewsRes.data && reviewsRes.data.length > 0) {
              const avgRating = reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length;
              reviewsMap[animal._id] = {
                avgRating,
                count: reviewsRes.data.length
              };
            }
          } catch (error) {
            reviewsMap[animal._id] = { avgRating: 0, count: 0 };
          }
        })
      );
      setRelatedReviews(reviewsMap);
    } catch (error) {
      console.error('Failed to load related animals');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/animal/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const convResponse = await apiClient.post('/api/messages/conversation', {
        receiverId: animal.seller._id,
        animalId: animal._id
      });

      await apiClient.post('/api/messages', {
        receiverId: animal.seller._id,
        animalId: animal._id,
        message: message,
        conversationId: convResponse.data.conversationId
      });

      toast.success('Message sent successfully');
      setMessage('');
      navigate('/messages');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    try {
      if (!animal.seller || !animal.seller._id) {
        toast.error('Seller information not available');
        return;
      }

      await apiClient.post('/api/reviews', {
        sellerId: animal.seller._id || animal.seller,
        animalId: animal._id,
        rating: Number(reviewData.rating),
        comment: reviewData.comment || ''
      });
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(id);
      if (!isInWishlist(id)) {
        toast.success('Added to wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!animal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                {animal.images && animal.images.length > 0 ? (
                  animal.images.map((image, index) => (
                    <div key={index} className="relative h-64 bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={image}
                        alt={`${animal.title} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FaPaw className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{animal.title}</h1>

              {/* Star Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {avgRating} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Species</p>
                  <p className="font-semibold">{animal.species}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Breed</p>
                  <p className="font-semibold">{animal.breed}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Age</p>
                  <p className="font-semibold">{animal.age} months</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p className="font-semibold capitalize">{animal.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Health Status</p>
                  <p className="font-semibold capitalize">{animal.healthStatus.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Category</p>
                  <p className="font-semibold capitalize">{animal.category}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-2">Description</p>
                <p className="text-gray-700">{animal.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {user && user.role === 'buyer' && user._id !== animal.seller._id && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Write your review..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{review.buyer.name}</span>
                      </div>
                      {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-blue-600">₹{animal.price.toLocaleString()}</p>
                <p className="text-gray-500 mt-2">
                  {animal.category === 'adoption' ? 'Adoption Fee' : 'Price'}
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  animal.category === 'adoption' ? 'bg-green-500' : 'bg-blue-600'
                }`}>
                  {animal.category === 'adoption' ? 'For Adoption' : 'For Sale'}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist}
                className={`w-full py-3 rounded-md font-semibold transition-colors mb-4 flex items-center justify-center gap-2 ${
                  isInWishlist(id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isInWishlist(id) ? <FaHeart /> : <FaRegHeart />}
                {isInWishlist(id) ? 'Saved' : 'Save'}
              </button>

              {user && user._id !== animal.seller._id && (
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message to seller..."
                    rows="4"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={handleContactSeller}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Contact Seller
                  </button>
                </div>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Login to Contact Seller
                </button>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Seller Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">{animal.seller.name}</p>
                </div>
                {animal.seller.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope />
                    <span>{animal.seller.email}</span>
                  </div>
                )}
                {animal.seller.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone />
                    <span>{animal.seller.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt />
                  <span>
                    {animal.location.city}, {animal.location.state}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Animals Section */}
        {relatedAnimals.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Related Animals</h2>
            <p className="text-gray-600 mb-6">
              More {animal.species} in {animal.location.state}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAnimals.map((relatedAnimal) => (
                <AnimalCard
                  key={relatedAnimal._id}
                  animal={relatedAnimal}
                  avgRating={relatedReviews[relatedAnimal._id]?.avgRating || 0}
                  reviewCount={relatedReviews[relatedAnimal._id]?.count || 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalDetail;

