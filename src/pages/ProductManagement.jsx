import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import * as Yup from 'yup';

const ProductManagement = () => {
  const BASE_URL = api.defaults.baseURL.split('/api')[0];

  // Logic to handle paths that already start with /uploads/products
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
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
      const params = { page: pagination.currentPage, limit: 12, search: searchQuery, category: filters.category, status: filters.status };
      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.products);
        setPagination(prev => ({ ...prev, totalPages: data.totalPages, total: data.total }));
      }
    } catch (error) { toast.error('Fetch failed'); } finally { setLoading(false); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setExistingImages(product.images || []);
    setNewImages([]);
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
    setFormData({ name: '', description: '', category: '', brand: '', price: '', quantity: '', status: 'active', specifications: {} });
    setExistingImages([]); setNewImages([]); setFormErrors({}); setEditingProduct(null); setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const submitData = new FormData();
      
      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specifications') submitData.append(key, JSON.stringify(value));
        else submitData.append(key, value);
      });

      // Append Image instructions for backend
      submitData.append('existingImages', JSON.stringify(existingImages));
      newImages.forEach(file => submitData.append('images', file));

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';
      const { data } = await api[method](url, submitData);

      if (data.success) {
        toast.success(editingProduct ? 'Updated' : 'Created');
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errs = {}; error.inner.forEach(e => errs[e.path] = e.message);
        setFormErrors(errs);
      } else toast.error(error.response?.data?.message || 'Error');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2"><Plus/> Add Product</button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p._id} className="bg-white p-4 rounded-2xl shadow-sm border">
            <img src={getImageUrl(p.images[0])} className="w-full h-48 object-cover rounded-xl mb-4" alt="" />
            <h3 className="font-bold truncate">{p.name}</h3>
            <p className="text-blue-600 font-bold">LKR {p.price.toLocaleString()}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(p)} className="flex-1 bg-slate-100 py-2 rounded-lg flex justify-center"><Edit2 size={16}/></button>
              <button onClick={async () => { if(window.confirm('Delete?')) await api.delete(`/products/${p._id}`); fetchProducts(); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-3 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}

              {/* RESTORED DESCRIPTION */}
              <textarea placeholder="Description" rows="3" className="w-full p-3 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}

              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Brand" className="p-3 border rounded-xl" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <input type="number" placeholder="Price" className="p-3 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <input type="number" placeholder="Stock" className="p-3 border rounded-xl" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>

              {/* IMAGE UPLOAD UI */}
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={getImageUrl(img)} className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                  </div>
                ))}
                {newImages.map((file, i) => (
                  <div key={i} className="relative aspect-square border-2 border-blue-500 rounded-lg">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="text-slate-400" />
                  <input type="file" multiple className="hidden" onChange={e => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={resetForm}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-xl">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save'}
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