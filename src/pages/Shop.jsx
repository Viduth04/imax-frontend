import { useState, useEffect } from 'react';
import { Search, Filter, X, ShoppingCart, Box, Star, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api.js'; 
import { getImageUrl } from '../utils/imageUtils.js';

const Shop = () => {
  const { user } = useAuth(); 
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [brands, setBrands] = useState([]);
  const categoryOptions = [
    'Laptops', 'Desktops', 'Processors (CPU)', 'Motherboards', 
    'RAM (Memory)', 'Graphics Cards (GPU)', 'Storage (SSD/HDD)', 
    'Power Supplies (PSU)', 'Monitors', 'Casing', 
    'Cooling Solutions', 'Keyboards & Mice', 'Accessories'
  ];

  // Fetch products when dependencies change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchProducts();
    }, searchQuery ? 500 : 0); // Debounce search for better performance

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters, pagination.currentPage]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        status: 'active',
        sort: filters.sort,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice })
      };

      const { data } = await api.get('/products', { params });
      
      if (data.success) {
        setProducts(data.products);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total
        });
      }
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await api.get('/products/brands');
      if (data.success) setBrands(data.brands);
    } catch (error) {
      console.error('Failed to fetch brands');
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Could not add to cart');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt'
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '-createdAt').length + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      {/* Hero Header */}
      <div className="bg-[#1A1A1A] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Hardware Solutions</h1>
          <p className="text-gray-400">Premium components for high-performance builds</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hardware components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>

            {/* Mobile Filter UI */}
            {showFilters && (
              <div className="lg:hidden bg-white p-6 rounded-2xl border border-slate-200 mb-6 animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Active Filters</h3>
                    <X className="w-5 h-5" onClick={() => setShowFilters(false)} />
                </div>
                {/* Mobile version of selectors here (omitted for brevity, matches desktop) */}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500">Loading catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
                <Box className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No items found</h3>
                <p className="text-slate-500 mb-6">Adjust your filters or search keywords</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Clear All</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                    {/* Image Section */}
                    <div className="relative h-56 bg-slate-50 cursor-pointer overflow-hidden" onClick={() => handleProductClick(product._id)}>
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400?text=Image+Unavailable';
                        }}
                      />
                      {product.quantity === 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-4 py-1 bg-red-600 text-white rounded-full text-xs font-bold uppercase">Sold Out</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">{product.brand}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{product.category}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-4 line-clamp-2 h-12 cursor-pointer hover:text-blue-600" onClick={() => handleProductClick(product._id)}>
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-slate-900">
                            LKR {product.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                  className="px-4 py-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="font-bold text-slate-700">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                  className="px-4 py-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;