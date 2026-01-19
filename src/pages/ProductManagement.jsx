import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Search, Upload, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yup';

const ProductManagement = () => {
  // --- CONFIGURATION ---
  // This extracts the base domain (e.g., http://localhost:10000)
  const BASE_URL = api.defaults.baseURL.split('/api')[0];

  /**
   * Helper to construct the full image URL.
   * Logic:
   * 1. If path is missing, return placeholder.
   * 2. If path is already a full URL (http...), return as-is.
   * 3. Clean Windows backslashes (\) to forward slashes (/).
   * 4. Ensure path starts with / to connect to BASE_URL correctly.
   */
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    
    // Fix: Remove redundant "uploads" if it's already in the path and construct clean URL
    const cleanPath = path.replace(/\\/g, '/'); // Fix Windows slashes
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${BASE_URL}${finalPath}`;
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
    specifications: {} 
  });

  const [existingImages, setExistingImages] = useState([]); 
  const [newImages, setNewImages] = useState([]); 
  const [formErrors, setFormErrors] = useState({});

  // --- VALIDATION ---
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').min(3).max(200),
    description: Yup.string().required('Description is required').min(10),
    category: Yup.string().required('Required'),
    brand: Yup.string().required('Required'),
    price: Yup.number().required('Required').positive(),
    quantity: Yup.number().required('Required').min(0).integer(),
    status: Yup.string().oneOf(['active', 'inactive']),
  });

  // --- DATA FETCHING ---
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
    if (!window.confirm('Are you sure?')) return;
    try {
      const { data } = await api.delete(`/products/${productId}`);
      if (data.success) {
        toast.success('Deleted');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '', brand: '', price: '', quantity: '', status: 'active', specifications: {} });
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
        submitData.append(key, key === 'specifications' ? JSON.stringify(value) : value);
      });
      submitData.append('existingImages', JSON.stringify(existingImages));
      newImages.forEach(file => submitData.append('images', file));

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';
      const { data } = await api[method](url, submitData);

      if (data.success) {
        toast.success('Inventory Updated');
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach(err => errors[err.path] = err.message);
        setFormErrors(errors);
      } else {
        toast.error(error.response?.data?.message || 'Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">{pagination.total} Products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-transform active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="px-4 py-3 bg-white border rounded-2xl outline-none" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="px-4 py-3 bg-white border rounded-2xl outline-none" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="group bg-white rounded-3xl border p-4 hover:shadow-xl transition-all flex flex-col">
               <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Image+Not+Found'; }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold text-white uppercase ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      {product.status}
                    </span>
                  </div>
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-800 line-clamp-2">{product.name}</h3>
                 <p className="text-blue-600 font-bold text-lg mt-1">LKR {product.price.toLocaleString()}</p>
               </div>
               <div className="flex gap-2 mt-4">
                 <button onClick={() => handleEdit(product)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center gap-1 font-bold">
                   <Edit2 className="w-4 h-4" /> Edit
                 </button>
                 <button onClick={() => handleDelete(product._id)} className="p-2 bg-slate-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
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
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                  {formErrors.name && <p className="text-red-500 text-xs font-bold">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Price (LKR)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>

              {/* Image Manager */}
              <div>
                <label className="block text-sm font-bold mb-3">Product Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {existingImages.map((img, i) => (
                    <div key={`ex-${i}`} className="relative aspect-square border rounded-xl overflow-hidden group">
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="product" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                    </div>
                  ))}
                  {newImages.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square border-2 border-blue-400 rounded-xl overflow-hidden">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      <button type="button" onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                    <Upload className="text-slate-400" />
                    <span className="text-[10px] font-bold mt-1">UPLOAD</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={resetForm} className="px-6 py-2 font-bold text-slate-500">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="px-10 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Product'}
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