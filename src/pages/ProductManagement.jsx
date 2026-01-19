import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Plus, Edit2, Trash2, X, Box, Tag, 
  Search, Filter, Upload, Loader2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yup';

const ProductManagement = () => {
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
    price: Yup.number().required('Required').positive('Must be positive'),
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
    // Crucial: Set existing images from the product
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
      
      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specifications') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });

      // SYNC IMAGES: Tell backend which old images to KEEP
      submitData.append('existingImages', JSON.stringify(existingImages));
      
      // Append NEW files
      newImages.forEach(file => {
        submitData.append('images', file);
      });

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';

      const { data } = await api[method](url, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 font-medium">System showing {pagination.total} total items</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
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
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select 
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none"
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
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Syncing database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="group bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-xl transition-all duration-300">
               <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {product.status}
                    </span>
                  </div>
               </div>

               <div className="px-2">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{product.name}</h3>
                    <span className="text-blue-600 font-black whitespace-nowrap">LKR {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1"><Box className="w-4 h-4" /> {product.quantity} units</span>
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {product.category}</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="px-4 py-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-6 h-6 text-slate-600" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.name ? 'border-red-500' : 'border-slate-300'}`} />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Brand *</label>
                  <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {formErrors.brand && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price (LKR) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity *</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {formErrors.quantity && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none outline-none" />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.description}</p>}
              </div>

              {/* IMAGE SECTION */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Images</label>
                <div className="space-y-4">
                  <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-8 transition-colors hover:border-blue-400 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                         const files = Array.from(e.target.files);
                         setNewImages(prev => [...prev, ...files]);
                         e.target.value = null; 
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-blue-500" />
                    <p className="text-slate-500 text-sm font-medium">Click or drag images to upload</p>
                  </div>
                  
                  {(existingImages.length > 0 || newImages.length > 0) && (
                    <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      {/* Current Images on Server */}
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative w-24 h-24 group">
                          <img src={url} alt="" className="w-full h-full object-cover rounded-xl shadow-md" />
                          <button
                            type="button"
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* New Previews to be Uploaded */}
                      {newImages.map((file, index) => (
                        <div key={`new-${index}`} className="relative w-24 h-24 group">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl shadow-md border-2 border-blue-400" />
                          <button
                            type="button"
                            onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute -bottom-2 -left-2 bg-blue-500 text-[8px] text-white px-2 py-0.5 rounded-full font-bold">NEW</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : (editingProduct ? 'Update Product' : 'Create Product')}
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