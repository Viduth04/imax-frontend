import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, Tag, 
  Minus, Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
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
    if (!user && !isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.quantity) {
      setQuantity(newQty);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!product) return null;

  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/shop')} className="group flex items-center text-slate-600 hover:text-blue-600 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 lg:p-12">
            
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                <img
                  key={`${product._id}-${selectedImage}`}
                  src={hasImages ? getImageUrl(product.images[selectedImage]) : getImageUrl(null)}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=Image+Not+Found'; }}
                />
                
                {hasImages && product.images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button onClick={() => setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length)} className="p-2 bg-white/90 rounded-full shadow-md pointer-events-auto hover:bg-white"><ChevronLeft/></button>
                    <button onClick={() => setSelectedImage(prev => (prev + 1) % product.images.length)} className="p-2 bg-white/90 rounded-full shadow-md pointer-events-auto hover:bg-white"><ChevronRight/></button>
                  </div>
                )}

                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-6 py-2 bg-white text-red-600 rounded-full font-bold shadow-xl border border-red-100">Sold Out</span>
                  </div>
                )}
              </div>

              {hasImages && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-blue-500 scale-95' : 'border-slate-200 opacity-60'}`}>
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{product.category}</span>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-4 mb-2 leading-tight">{product.name}</h1>
                <div className="flex items-center text-slate-500 font-medium"><Tag className="w-4 h-4 mr-2 text-blue-500" />{product.brand}</div>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-blue-600">LKR {(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`ml-4 text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                </span>
              </div>

              <div className="space-y-6 flex-1">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                </section>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(product.specifications).map(([k, v]) => (
                        <div key={k} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{k}</span>
                          <span className="text-slate-700 font-medium text-sm">{v}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="p-3 text-slate-600 hover:bg-white rounded-xl disabled:opacity-30"><Minus/></button>
                  <span className="w-12 text-center font-bold text-lg text-slate-800">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.quantity} className="p-3 text-slate-600 hover:bg-white rounded-xl disabled:opacity-30"><Plus/></button>
                </div>
                <button onClick={handleAddToCart} disabled={adding || product.quantity === 0} className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold text-lg disabled:opacity-70 shadow-lg shadow-blue-200">
                  {adding ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"/> : <ShoppingCart className="w-5 h-5" />}
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;