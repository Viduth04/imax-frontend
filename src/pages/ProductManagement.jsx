import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Plus, Edit2, Trash2, X, Box, Tag, 
  Search, Filter, Upload, Loader2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import * as Yup from 'yup';

const ProductManagement = () => {
  // ... (Previous State definitions remain the same)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Validation Logic (using Yup as you did)
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required').min(3).max(200),
    description: Yup.string().required('Required').min(10),
    category: Yup.string().required('Required'),
    brand: Yup.string().required('Required'),
    price: Yup.number().required().positive(),
    quantity: Yup.number().required().min(0).integer(),
    status: Yup.string().oneOf(['active', 'inactive']),
  });

  // Debounced fetch logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500); // Wait 500ms after last keystroke

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters, pagination.currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: searchQuery,
        category: filters.category,
        status: filters.status
      };

      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.products);
        setPagination(prev => ({ ...prev, totalPages: data.totalPages, total: data.total }));
      }
    } catch (error) {
      toast.error('Inventory fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      if (data.success) setCategories(data.categories);
    } catch (e) { console.error("Category fetch failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specifications') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });

      images.forEach(img => submitData.append('images', img));

      const request = editingProduct 
        ? api.put(`/products/${editingProduct._id}`, submitData)
        : api.post('/products', submitData);

      const { data } = await request;
      
      if (data.success) {
        toast.success(editingProduct ? 'Product Updated' : 'Product Created');
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach(err => errors[err.path] = err.message);
        setFormErrors(errors);
      } else {
        toast.error(error.response?.data?.message || 'Server Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Dashboard Stats / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 font-medium">System showing {pagination.total} total items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add New Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Render categories dynamically from state */}
        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none"
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Product Table / Grid Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Syncing database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="group bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-xl transition-all duration-300">
               {/* Image Container */}
               <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {product.status}
                    </span>
                  </div>
               </div>

               {/* Content */}
               <div className="px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{product.name}</h3>
                    <span className="text-blue-600 font-black">LKR {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1"><Box className="w-4 h-4" /> {product.quantity} units</span>
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {product.category}</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="px-4 py-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination component logic would go here */}
    </div>
  );
};

export default ProductManagement;