import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter, FaPaw } from 'react-icons/fa';

const BuyerDashboard = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    species: '',
    breed: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    state: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnimals();
  }, [filters, page, searchTerm]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const params = { 
        ...filters, 
        page, 
        limit: 12,
        ...(searchTerm && { search: searchTerm })
      };
      const response = await axios.get('/api/animals', { params });
      setAnimals(response.data.animals);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      species: '',
      breed: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      state: '',
      category: ''
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Browse Animals</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2" />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-md"
            />
            <select
              value={filters.species}
              onChange={(e) => handleFilterChange('species', e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Species</option>
              <optgroup label="Pets">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
              </optgroup>
              <optgroup label="Farm Animals">
                <option value="cow">Cow</option>
                <option value="buffalo">Buffalo</option>
                <option value="ox">Ox</option>
                <option value="camel">Camel</option>
                <option value="goat">Goat</option>
                <option value="horse">Horse</option>
                <option value="donkey">Donkey</option>
                <option value="sheep">Sheep</option>
                <option value="pig">Pig</option>
                <option value="chicken">Chicken</option>
                <option value="duck">Duck</option>
                <option value="turkey">Turkey</option>
              </optgroup>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              <option value="sale">For Sale</option>
              <option value="adoption">For Adoption</option>
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="State"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {/* Animals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
          <div className="text-center py-12">
            <FaPaw className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No animals found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {animals.map((animal) => (
                <Link
                  key={animal._id}
                  to={`/animal/${animal._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {animal.images && animal.images.length > 0 ? (
                      <img
                        src={animal.images[0]}
                        alt={animal.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaPaw className="text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                      ₹{animal.price}
                    </div>
                    {animal.category === 'adoption' && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        Adoption
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{animal.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {animal.species} • {animal.breed}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {animal.location.city}, {animal.location.state}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;

