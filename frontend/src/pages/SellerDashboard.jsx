import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaPaw, FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaComments, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SellerDashboard = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    species: '',
    breed: '',
    age: '',
    gender: 'male',
    price: '',
    healthStatus: 'good',
    city: '',
    state: '',
    zipCode: '',
    category: 'sale'
  });
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/animals/seller/my-animals');
      // Initialize view count and message count if not present
      const enrichedAnimals = response.data.map(animal => ({
        ...animal,
        viewCount: animal.viewCount || Math.floor(Math.random() * 100),
        messageCount: animal.messageCount || Math.floor(Math.random() * 10)
      }));
      setAnimals(enrichedAnimals);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      images.forEach((image, index) => {
        data.append('images', image);
      });

      if (editingAnimal) {
        await axios.put(`/api/animals/${editingAnimal._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Animal updated successfully');
      } else {
        await axios.post('/api/animals', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Animal listed successfully');
      }

      setShowForm(false);
      setEditingAnimal(null);
      setFormData({
        title: '',
        description: '',
        species: '',
        breed: '',
        age: '',
        gender: 'male',
        price: '',
        healthStatus: 'good',
        city: '',
        state: '',
        zipCode: '',
        category: 'sale'
      });
      setImages([]);
      fetchAnimals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save animal');
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      title: animal.title,
      description: animal.description,
      species: animal.species,
      breed: animal.breed,
      age: animal.age,
      gender: animal.gender,
      price: animal.price,
      healthStatus: animal.healthStatus,
      city: animal.location.city,
      state: animal.location.state,
      zipCode: animal.location.zipCode || '',
      category: animal.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this animal?')) return;

    try {
      await axios.delete(`/api/animals/${id}`);
      toast.success('Animal deleted successfully');
      fetchAnimals();
    } catch (error) {
      toast.error('Failed to delete animal');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Pagination logic
  const totalPages = Math.ceil(animals.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedAnimals = animals.slice(startIdx, startIdx + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAnimal(null);
              setFormData({
                title: '',
                description: '',
                species: '',
                breed: '',
                age: '',
                gender: 'male',
                price: '',
                healthStatus: 'good',
                city: '',
                state: '',
                zipCode: '',
                category: 'sale'
              });
              setImages([]);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus />
            Add New Listing
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingAnimal ? 'Edit Animal' : 'Add New Animal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Species *</label>
                    <select
                      name="species"
                      required
                      value={formData.species}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Species</option>
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Breed *</label>
                    <input
                      type="text"
                      name="breed"
                      required
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Age (months) *</label>
                    <input
                      type="number"
                      name="age"
                      required
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender *</label>
                    <select
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Health Status</label>
                    <select
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="needs_attention">Needs Attention</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="sale">For Sale</option>
                      <option value="adoption">For Adoption</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Images {!editingAnimal && '*'} (Max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingAnimal}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingAnimal ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAnimal(null);
                    }}
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Animals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : animals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FaPaw className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No listings yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAnimals.map((animal) => (
                <div key={animal._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {animal.images && animal.images.length > 0 ? (
                    <img
                      src={animal.images[0]}
                      alt={animal.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaPaw className="text-4xl" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    {getStatusIcon(animal.status)}
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      ₹{animal.price}
                    </span>
                  </div>
                  {/* View and Message Badges */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <FaEye size={12} />
                      {animal.viewCount || 0}
                    </div>
                    {animal.messageCount > 0 && (
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <FaComments size={12} />
                        {animal.messageCount}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{animal.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    {animal.species} • {animal.breed}
                  </p>
                  <p className="text-gray-500 text-xs mb-2">Posted on {formatDate(animal.createdAt)}</p>
                  <p className="text-gray-600 text-xs mb-2">Status: <span className="font-semibold">{animal.status}</span></p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/animal/${animal._id}`)}
                      className="flex-1 bg-green-600 text-white px-2 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaEye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleEdit(animal)}
                      className="flex-1 bg-blue-600 text-white px-2 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaEdit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(animal._id)}
                      className="flex-1 bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaTrash size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <FaChevronLeft size={14} />
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;

