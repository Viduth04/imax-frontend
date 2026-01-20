import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Add Loader2 to your imports
import { ShoppingCart, ArrowLeft, Tag, Minus, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../api.js'; 
import { getImageUrl } from '../utils/imageUtils.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); 
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      if (data.success) {
        setProduct(data.product);
      }
    } catch (error) {
      toast.error('Failed to fetch product');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!product) return null;

  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/shop')} className="flex items-center text-slate-600 hover:text-blue-600 mb-6 font-medium transition-all">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 lg:p-12">
          {/* IMAGE SECTION */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
              <img 
                src={hasImages ? getImageUrl(product.images[selectedImage]) : getImageUrl(null)}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => { 
                  console.error("Failed to load image in Detail Page:", e.target.src);
                  e.target.src = 'https://placehold.co/600x600?text=Image+Not+Found'; 
                }}
              />
              {hasImages && product.images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={() => setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length)} className="p-2 bg-white/90 rounded-full shadow-md pointer-events-auto hover:bg-white transition-colors"><ChevronLeft/></button>
                  <button onClick={() => setSelectedImage(prev => (prev + 1) % product.images.length)} className="p-2 bg-white/90 rounded-full shadow-md pointer-events-auto hover:bg-white transition-colors"><ChevronRight/></button>
                </div>
              )}
            </div>
            
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`shrink-0 w-20 h-20 rounded-xl border-2 transition-all overflow-hidden ${selectedImage === idx ? 'border-blue-500 scale-95' : 'border-slate-100'}`}>
                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4 uppercase tracking-wider">{product.category}</span>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{product.name}</h1>
            <p className="flex items-center text-slate-500 mb-6 font-medium"><Tag className="w-4 h-4 mr-2 text-blue-500" /> {product.brand}</p>
            
            <div className="mb-8">
              <p className="text-4xl font-black text-blue-600">LKR {product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className={`mt-2 font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>

            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-white rounded-xl transition-all"><Minus className="w-5 h-5"/></button>
                <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} className="p-3 hover:bg-white rounded-xl transition-all"><Plus className="w-5 h-5"/></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={adding || product.quantity === 0}
                className="flex-1 bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;