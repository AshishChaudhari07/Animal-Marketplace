import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { FaSearch, FaPaw } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AnimalCard from '../components/AnimalCard';
import Pagination from '../components/Pagination';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { useTranslation } from 'react-i18next';

const SPECIES_LIST = [
  'Dog', 'Cat', 'Bird', 'Rabbit',
  'Cow', 'Buffalo', 'Ox', 'Camel', 'Goat', 'Horse', 'Donkey', 'Sheep',
  'Pig', 'Chicken', 'Duck', 'Turkey', 'Other'
];

const STATES_LIST = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animals, setAnimals] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    species: '',
    category: '',
    state: '',
    minPrice: 0,
    maxPrice: 1000000
  });

  // Fetch total animals count
  useEffect(() => {
    fetchTotalAnimals();
  }, []);

  // Fetch animals when filters change
  useEffect(() => {
    fetchAnimals();
  }, [filters, sortBy, currentPage, searchTerm]);

  const fetchTotalAnimals = async () => {
    try {
      const response = await apiClient.get('/api/animals', { params: { limit: 1 } });
      setTotalAnimals(response.data.total);
    } catch (error) {
      console.error('Failed to fetch total animals');
    }
  };

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...filters,
        ...(searchTerm && { search: searchTerm })
      };

      // Add sorting
      if (sortBy === 'price-low') {
        params.sortBy = 'price';
        params.sortOrder = 'asc';
      } else if (sortBy === 'price-high') {
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      }

      const response = await apiClient.get('/api/animals', { params });
      setAnimals(response.data.animals);

      // Fetch reviews for each animal
      const reviewsMap = {};
      await Promise.all(
        response.data.animals.map(async (animal) => {
          try {
            const reviewsRes = await apiClient.get(`/api/reviews/animal/${animal._id}`);
            if (reviewsRes.data && reviewsRes.data.length > 0) {
              const avgRating =
                reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length;
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
      setReviews(reviewsMap);
    } catch (error) {
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    // Show suggestions
    if (value.length > 0) {
      const filtered = SPECIES_LIST.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handlePriceChange = (min, max) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaPaw className="text-6xl mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {t('home.title')}
          </h1>
          <p className="text-lg mb-2 font-semibold">
            {totalAnimals}+ {t('home.verified')}
          </p>
          <p className="text-xl mb-8 opacity-90">
            {t('home.subtitle')}
          </p>

          {/* Search Bar with Auto-suggestions */}
          <div className="max-w-2xl mx-auto mb-6 relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {searchSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-colors">
                <FaSearch className="inline mr-2" />
                {t('home.search')}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 justify-center flex-wrap">
            <select
              value={filters.species}
              onChange={(e) => handleFilterChange('species', e.target.value)}
              className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">{t('home.allSpecies')}</option>
              {SPECIES_LIST.map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">{t('home.allCategories')}</option>
              <option value="sale">{t('animal.forSale')}</option>
              <option value="adoption">{t('animal.forAdoption')}</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">{t('home.allLocations')}</option>
              {STATES_LIST.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <PriceRangeSlider
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={handlePriceChange}
                loading={loading}
              />

              {/* Sorting */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4">{t('home.sortBy')}</h3>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSortBy(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer"
                >
                  <option value="newest">{t('home.newest')}</option>
                  <option value="price-low">{t('home.priceLow')}</option>
                  <option value="price-high">{t('home.priceHigh')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Animals Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">{t('home.featured')}</h2>
              <p className="text-gray-600 text-sm">
                Showing {animals.length === 0 ? 0 : (currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, totalAnimals)} of {totalAnimals}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : animals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <FaPaw className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">{t('home.noAnimals')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {animals.map((animal) => (
                    <AnimalCard
                      key={animal._id}
                      animal={animal}
                      avgRating={reviews[animal._id]?.avgRating || 0}
                      reviewCount={reviews[animal._id]?.count || 0}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalAnimals / 12)}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

