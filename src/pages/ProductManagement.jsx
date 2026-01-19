import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Box, Tag, 
  Search, Upload, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yup';

const ProductManagement = () => {
  // --- CONFIGURATION ---
  // This extracts the base URL (e.g., http://localhost:5000) from your axios config
  const BASE_URL = api.defaults.baseURL.replace('/api', '');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    "Laptops", "Desktops", "Processors (CPU)", "Motherboards", 
    "RAM (Memory)", "Graphics Cards (GPU)", "Storage (SSD/HDD)", 
    "Power Supplies (PSU)", "Monitors", "Casing", "Cooling Solutions", 
    "Keyboards & Mice", "Accessories"
  ]);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    quantity: '',
    status: 'active',
    specifications: {}
  });

  const [existingImages, setExistingImages] = useState([]); 
  const [newImages, setNewImages] = useState([]); 
  const [formErrors, setFormErrors] = useState({});
  
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required').min(3).max(200),
    description: Yup.string().required('Required').min(10),
    category: Yup.string().required('Required'),
    brand: Yup.string().required('Required'),
    price: Yup.number().required('Required').positive(),
    quantity: Yup.number().required('Required').min(0).integer(),
    status: Yup.string().oneOf(['active', 'inactive']),
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters.category, filters.status, pagination.currentPage]);

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
      if (data.success) {
        setCategories(prev => Array.from(new Set([...prev, ...data.categories])));
      }
    } catch (e) { console.error("Category fetch failed"); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setExistingImages(product.images || []); 
    setNewImages([]); 
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
      specifications: product.specifications || {}
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { data } = await api.delete(`/products/${productId}`);
      if (data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', category: '', brand: '',
      price: '', quantity: '', status: 'active', specifications: {}
    });
    setExistingImages([]);
    setNewImages([]);
    setFormErrors({});
    setEditingProduct(null);
    setShowModal(false);
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

      // Send instruction on which images to keep
      submitData.append('existingImages', JSON.stringify(existingImages));
      
      newImages.forEach(file => {
        submitData.append('images', file);
      });

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';

      const { data } = await api[method](url, submitData);

      if (data.success) {
        toast.success(editingProduct ? 'Product Updated' : 'Product Created');
        resetForm();
        await fetchProducts();
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach(err => errors[err.path] = err.message);
        setFormErrors(errors);
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 font-medium">{pagination.total} items total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-lg transition-all">
               <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={product.images?.[0] ? `${BASE_URL}${product.images[0]}` : 'https://placehold.co/400x400?text=No+Image'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Error'; }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                      {product.status}
                    </span>
                  </div>
               </div>

               <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
               <p className="text-blue-600 font-bold mb-4">LKR {product.price.toLocaleString()}</p>
               
               <div className="flex gap-2">
                 <button onClick={() => handleEdit(product)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors flex justify-center items-center gap-1">
                   <Edit2 className="w-4 h-4" /> Edit
                 </button>
                 <button onClick={() => handleDelete(product._id)} className="p-2 bg-slate-100 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Images</label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {/* Current Server Images */}
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={`${BASE_URL}${img}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={12}/></button>
                    </div>
                  ))}
                  {/* New Upload Previews */}
                  {newImages.map((file, i) => (
                    <div key={i} className="relative aspect-square border-2 border-blue-400 rounded-lg overflow-hidden">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50">
                    <Upload className="text-slate-400" />
                    <input type="file" multiple className="hidden" onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="px-6 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;