import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AnimalCard = ({ animal, avgRating, reviewCount }) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const inWishlist = isInWishlist(animal._id);
  const categoryColor = animal.category === 'adoption' ? 'bg-green-500' : 'bg-blue-600';
  const categoryLabel = animal.category === 'adoption' ? t('animal.forAdoption') : t('animal.forSale');

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error(t('animal.loginToSave'));
      navigate('/login');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(animal._id);
      if (!inWishlist) {
        toast.success(t('animal.addedWishlist'));
      } else {
        toast.success(t('animal.removedWishlist'));
      }
    } catch (error) {
      toast.error(t('animal.wishlistFailed'));
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/animal/${animal._id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gray-200 overflow-hidden group">
        {animal.images && animal.images.length > 0 ? (
          <img
            src={animal.images[0]}
            alt={animal.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FaPaw className="text-4xl" />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          ₹{animal.price.toLocaleString()}
        </div>

        {/* Category Tag */}
        <div className={`absolute top-2 right-2 mt-8 ${categoryColor} text-white px-2 py-1 rounded text-xs font-semibold shadow-lg`}>
          {categoryLabel}
        </div>

        {/* Wishlist Heart - Top Left */}
        <button
          onClick={handleWishlistToggle}
          disabled={isAddingToWishlist}
          className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
            inWishlist
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white text-gray-400 hover:text-red-500 shadow-md'
          }`}
        >
          {inWishlist ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
        </button>

        {/* View Details Button - Shows on Hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <button
              onClick={handleViewDetails}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t('animal.viewDetails')}
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 truncate hover:text-blue-600">
          {animal.title}
        </h3>

        {/* Star Rating - Show if has ratings */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={12}
                  className={i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Species and Breed */}
        <p className="text-gray-600 text-sm mb-2">
          {animal.species} • {animal.breed}
        </p>

        {/* Location */}
        <p className="text-gray-500 text-sm mb-3">
          {animal.location.city}, {animal.location.state}
        </p>

        {/* Age and Gender Badge */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {animal.age} months
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
            {animal.gender}
          </span>
        </div>

        {/* Action Button - Always visible but inactive when not hovered */}
        <button
          onClick={handleViewDetails}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
            isHovered
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isHovered ? t('animal.viewDetails') : t('animal.learnMore')}
        </button>
      </div>
    </div>
  );
};

export default AnimalCard;
