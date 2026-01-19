import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yun';

const ProductManagement = () => {
  const BASE_URL = api.defaults.baseURL.split('/api')[0];

  // Logic to handle full image pathing
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    
    // Ensure we don't double up on slashes
    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${BASE_URL}${finalPath}`;
  };

  const [products, setProducts] = useState([]);
  const [categories] = useState([
    "Laptops", "Desktops", "Processors (CPU)", "Motherboards", "RAM (Memory)", 
    "Graphics Cards (GPU)", "Storage (SSD/HDD)", "Power Supplies (PSU)", 
    "Monitors", "Casing", "Cooling Solutions", "Keyboards & Mice", "Accessories"
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
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required').min(3),
    description: Yup.string().required('Required').min(10),
    category: Yup.string().required('Required'),
    brand: Yup.string().required('Required'),
    price: Yup.number().required('Required').positive(),
    quantity: Yup.number().required('Required').min(0),
  });

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, filters, pagination.currentPage]);

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
        setPagination(prev => ({ 
          ...prev, 
          totalPages: data.totalPages, 
          total: data.total 
        }));
      }
    } catch (error) { 
      toast.error('Fetch failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Ensure we store the raw paths from the database, not full URLs
    const rawImages = (product.images || []).map(img => {
      // If it's a full URL, extract just the path
      if (img.startsWith('http')) {
        const url = new URL(img);
        return url.pathname;
      }
      return img;
    });
    setExistingImages(rawImages);
    setNewImages([]);
    setNewImagePreviews([]);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      brand: product.brand,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
      specifications: product.specifications || {}
    });
    setShowModal(true);
  };

  const resetForm = () => {
    // Clean up all object URLs before resetting
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setFormData({ name: '', description: '', category: '', brand: '', price: '', quantity: '', status: 'active', specifications: {} });
    setExistingImages([]); 
    setNewImages([]); 
    setNewImagePreviews([]);
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
        if (key === 'specifications') submitData.append(key, JSON.stringify(value));
        else submitData.append(key, value);
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
        const errs = {}; 
        error.inner.forEach(e => errs[e.path] = e.message);
        setFormErrors(errs);
      } else {
        toast.error(error.response?.data?.message || 'Error occurred');
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-500">{pagination.total} Products Total</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-transform active:scale-95">
            <Plus size={20}/> Add New Product
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p._id} className="bg-white p-4 rounded-2xl shadow-sm border group hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 mb-4">
                <img 
                    src={getImageUrl(p.images?.[0])} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={p.name}
                    onError={(e) => e.target.src = 'https://placehold.co/400x400?text=Error+Loading'}
                />
              </div>
              <h3 className="font-bold text-slate-800 line-clamp-1">{p.name}</h3>
              <p className="text-blue-600 font-bold text-lg">LKR {p.price.toLocaleString()}</p>
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(p)} className="flex-1 bg-slate-100 hover:bg-blue-600 hover:text-white py-2 rounded-lg flex justify-center items-center gap-2 transition-colors font-semibold text-slate-700">
                    <Edit2 size={16}/> Edit
                </button>
                <button onClick={async () => { if(window.confirm('Delete this product?')) { await api.delete(`/products/${p._id}`); fetchProducts(); } }} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                    <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1">Product Name</label>
                <input type="text" placeholder="e.g. ASUS ROG Strix" className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea placeholder="Provide detailed specifications..." rows="4" className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.category}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Brand</label>
                    <input type="text" placeholder="Brand Name" className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                    {formErrors.brand && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.brand}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Price (LKR)</label>
                    <input type="number" placeholder="0.00" className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    {formErrors.price && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.price}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Stock Quantity</label>
                    <input type="number" placeholder="0" className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                    {formErrors.quantity && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.quantity}</p>}
                </div>
              </div>

              {/* IMAGE MANAGER */}
              <div>
                <label className="block text-sm font-bold mb-3">Product Images (Max 5)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {existingImages.map((img, i) => (
                        <div key={`ex-${i}`} className="relative aspect-square rounded-xl overflow-hidden border group">
                            <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                            <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                        </div>
                    ))}
                    {newImages.map((file, i) => {
                      const previewUrl = newImagePreviews[i];
                      return (
                        <div key={`new-${i}-${file.name}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-400 group">
                          <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button" 
                            onClick={() => {
                              // Clean up the object URL
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                              }
                              setNewImages(prev => prev.filter((_, idx) => idx !== i));
                              setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                            }} 
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      );
                    })}
                    { (existingImages.length + newImages.length) < 5 && (
                        <label className="aspect-square border-2 border-dashed border-slate-300 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500">
                            <Upload size={24}/>
                            <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const files = Array.from(e.target.files);
                                  // Check total limit
                                  const totalImages = existingImages.length + newImages.length + files.length;
                                  if (totalImages > 5) {
                                    toast.error(`Maximum 5 images allowed. You already have ${existingImages.length + newImages.length} images.`);
                                    e.target.value = '';
                                    return;
                                  }
                                  const previews = files.map(file => URL.createObjectURL(file));
                                  setNewImages([...newImages, ...files]);
                                  setNewImagePreviews([...newImagePreviews, ...previews]);
                                }
                                // Reset input to allow selecting the same file again
                                e.target.value = '';
                              }} 
                            />
                        </label>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={resetForm} className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-10 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Product'}
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