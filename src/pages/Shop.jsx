import { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, X, ShoppingCart, Box, Star, ChevronDown,
  SlidersHorizontal, Grid, List, Heart, Eye, Zap,
  Package, Truck, Shield, Award
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    inStock: false
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [brands, setBrands] = useState([]);
  const lastCacheVersion = useRef(sessionStorage.getItem('imageCacheVersion') || localStorage.getItem('imageCacheVersion') || '1');

  const categoryOptions = [
    'Laptops',
    'Desktops',
    'Processors (CPU)',
    'Motherboards',
    'RAM (Memory)',
    'Graphics Cards (GPU)',
    'Storage (SSD/HDD)',
    'Power Supplies (PSU)',
    'Monitors',
    'Casing',
    'Cooling Solutions',
    'Keyboards & Mice',
    'Accessories'
  ];

  const quickFilters = [
    { label: 'Gaming PCs', icon: Zap, category: 'Graphics Cards (GPU)' },
    { label: 'Laptops', icon: Package, category: 'Laptops' },
    { label: 'Processors', icon: Award, category: 'Processors (CPU)' },
    { label: 'Storage', icon: Box, category: 'Storage (SSD/HDD)' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, filters, pagination.currentPage]);

  useEffect(() => {
    fetchBrands();
  }, []);

  // Monitor cache version changes for automatic refresh
  useEffect(() => {
    const checkCacheVersion = () => {
      const currentVersion = sessionStorage.getItem('imageCacheVersion') || localStorage.getItem('imageCacheVersion');
      if (currentVersion && currentVersion !== lastCacheVersion.current) {
        console.log('🔄 Shop detected cache version change from', lastCacheVersion.current, 'to', currentVersion);
        lastCacheVersion.current = currentVersion;
        fetchProducts();
      }
    };

    // Check immediately
    checkCacheVersion();

    // Set up interval to check periodically
    const interval = setInterval(checkCacheVersion, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: viewMode === 'list' ? 8 : 12,
        status: 'active',
        sort: filters.sort,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.inStock && { quantity: 'gt:0' })
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
      console.error(error);
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
      sort: '-createdAt',
      inStock: false
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(productId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const applyQuickFilter = (category) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '-createdAt' && v !== false).length + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white mt-16">

      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4 mr-2" />
              Premium Computer Components
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up">
              Build Your Dream
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                PC Today
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Discover premium computer parts, expert guidance, and everything you need
              to create the perfect gaming or workstation setup.
            </p>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {quickFilters.map((filter, index) => (
                <button
                  key={filter.label}
                  onClick={() => applyQuickFilter(filter.category)}
                  className="group flex items-center px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <filter.icon className="w-5 h-5 mr-3 text-blue-200 group-hover:text-white transition-colors" />
                  <span className="font-medium">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for GPUs, CPUs, RAM, motherboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/95 backdrop-blur-sm text-slate-900 placeholder-slate-500 rounded-3xl shadow-2xl focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg font-medium transition-all duration-300 hover:shadow-blue-200/50"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-300"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-yellow-300/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-purple-300/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Active Filters & Controls Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Results Count & Active Filters */}
            <div className="flex items-center gap-4">
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">{pagination.total}</span> products found
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-sm">
                    ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied)
                  </span>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-200 text-sm font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2 bg-slate-100 border-0 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Modern Sidebar Filters */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 sticky top-24">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mr-4">
                  <SlidersHorizontal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Filters</h3>
                  <p className="text-sm text-slate-500">Refine your search</p>
                </div>
              </div>

              <div className="space-y-8">

                {/* In Stock Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-slate-700">In Stock Only</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4 flex items-center">
                    <Box className="w-4 h-4 mr-2 text-blue-600" />
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-purple-600" />
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4 flex items-center">
                    <span className="text-lg mr-2">💰</span>
                    Price Range (LKR)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin animation-reverse"></div>
                </div>
                <p className="mt-6 text-slate-600 font-medium">Finding the perfect components...</p>
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Product Grid/List */
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                : "space-y-6"
              }>
                {products.map((product, index) => (
                  <div
                    key={product._id}
                    className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-100 overflow-hidden group transition-all duration-300 hover:-translate-y-2 animate-fade-in-up ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >

                    {/* Product Image */}
                    <div className={`relative bg-gradient-to-br from-slate-50 to-slate-100 cursor-pointer overflow-hidden ${
                      viewMode === 'list' ? 'w-80 flex-shrink-0' : 'h-64'
                    }`} onClick={() => handleProductClick(product._id)}>

                      {/* Stock Badge */}
                      {product.quantity === 0 && (
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Out of Stock
                        </div>
                      )}

                      {/* Favorite Button */}
                      {user && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product._id);
                          }}
                          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${
                            favorites.has(product._id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(product._id) ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product._id);
                        }}
                        className="absolute bottom-4 right-4 z-10 p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-700 transform hover:scale-110"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.log("Image load error on Shop:", e.target.src);
                          e.target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                        <div className="flex items-center text-xs text-slate-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          <span>4.5</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 text-lg leading-tight">
                        {product.name}
                      </h3>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        High-quality {product.category.toLowerCase()} perfect for gaming and professional use.
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-black text-slate-900">
                            LKR {product.price.toLocaleString()}
                          </span>
                          <div className="text-xs text-slate-500 mt-1">
                            Free delivery available
                          </div>
                        </div>

                        <div className="flex items-center text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700">
                          <Truck className="w-3 h-3 mr-1" />
                          {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed font-bold transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        <button
                          onClick={() => handleProductClick(product._id)}
                          className="px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-slate-600 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-slate-600 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">

                {/* In Stock Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-slate-700">In Stock Only</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Price Range (LKR)</label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors duration-200 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Shop;