import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Search, Upload, Loader2, Settings2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yup';

const ProductManagement = () => {
  // --- CONFIGURATION ---
  const BASE_URL = api.defaults.baseURL.replace('/api', '').replace(/\/$/, "");

  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${formattedPath}`;
  };

  // --- STATE ---
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
    specifications: {} // Stores key-value pairs like { "CPU": "i7", "RAM": "16GB" }
  });

  const [existingImages, setExistingImages] = useState([]); 
  const [newImages, setNewImages] = useState([]); 
  const [formErrors, setFormErrors] = useState({});

  // --- VALIDATION ---
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').min(3).max(200),
    description: Yup.string().required('Description is required').min(10),
    category: Yup.string().required('Please select a category'),
    brand: Yup.string().required('Brand is required'),
    price: Yup.number().required('Price is required').positive('Price must be positive'),
    quantity: Yup.number().required('Quantity is required').min(0, 'Cannot be negative').integer(),
    status: Yup.string().oneOf(['active', 'inactive']),
  });

  // --- EFFECTS ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters.category, filters.status, pagination.currentPage]);

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

  // --- HANDLERS ---
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
    setFormErrors({});

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

      submitData.append('existingImages', JSON.stringify(existingImages));
      newImages.forEach(file => submitData.append('images', file));

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';

      const { data } = await api[method](url, submitData);

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
        toast.error("Please fix the errors in the form");
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium">Monitoring {pagination.total} products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or brand..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 shadow-sm cursor-pointer"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 shadow-sm cursor-pointer"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Syncing Inventory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="group bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col">
               <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Error+Loading'; }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-sm ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      {product.status}
                    </span>
                  </div>
               </div>

               <div className="flex-1">
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{product.category}</span>
                 <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                 <p className="text-slate-400 text-xs mb-3">{product.brand}</p>
                 <p className="text-xl font-black text-slate-900 mb-4">LKR {product.price.toLocaleString()}</p>
               </div>
               
               <div className="flex gap-2 mt-auto">
                 <button onClick={() => handleEdit(product)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center gap-2 font-bold text-sm">
                   <Edit2 className="w-4 h-4" /> Edit
                 </button>
                 <button onClick={() => handleDelete(product._id)} className="p-2.5 bg-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 custom-scrollbar">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{editingProduct ? 'Update Product' : 'Create New Product'}</h2>
                <p className="text-slate-500 text-sm">Fill in the details below to sync with the store</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Product Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className={`w-full px-5 py-3 border ${formErrors.name ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 ring-blue-500/10 outline-none transition-all`} 
                    placeholder="e.g. ASUS ROG Strix G15"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none appearance-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Brand</label>
                  <input 
                    type="text" 
                    value={formData.brand} 
                    onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none"
                    placeholder="e.g. ASUS"
                  />
                  {formErrors.brand && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit Price (LKR)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none font-mono"
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none"
                  />
                  {formErrors.quantity && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.quantity}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Description</label>
                <textarea 
                  rows="4"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none resize-none"
                  placeholder="Tell customers about this product..."
                ></textarea>
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.description}</p>}
              </div>

              {/* Image Manager */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700">Product Media</label>
                  <span className="text-xs font-bold text-slate-400">{existingImages.length + newImages.length} Images Selected</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Server Images */}
                  {existingImages.map((img, i) => (
                    <div key={`server-${i}`} className="relative aspect-square border border-slate-100 rounded-2xl overflow-hidden group shadow-sm">
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="product" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} 
                          className="bg-white text-red-500 p-2 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* New Previews */}
                  {newImages.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square border-2 border-blue-400 rounded-2xl overflow-hidden group shadow-md">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} 
                          className="bg-white text-red-500 p-2 rounded-xl"
                        >
                          <X size={18}/>
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase">New</div>
                    </div>
                  ))}

                  {/* Dropzone */}
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-600 group">
                    <div className="p-3 bg-slate-50 group-hover:bg-blue-100 rounded-full mb-2 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} 
                    />
                  </label>
                </div>
              </div>

              {/* Status & Submit */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'active'})}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400'}`}
                   >ACTIVE</button>
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'inactive'})}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.status === 'inactive' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400'}`}
                   >INACTIVE</button>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <button type="button" onClick={resetForm} className="flex-1 md:flex-none px-8 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 md:flex-none px-10 py-3 bg-blue-600 text-white rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                  >
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Syncing...</> : (editingProduct ? 'Update Product' : 'Launch Product')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;