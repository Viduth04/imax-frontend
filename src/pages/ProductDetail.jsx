import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, Package, Box, Tag, 
  Minus, Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../api.js'; // Used this instead of axios
import { getImageUrl } from '../utils/imageUtils.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // Assuming checkAuth is a function or boolean
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Use the 'api' instance instead of raw axios
      const { data } = await api.get(`/products/${id}`);
      if (data.success) {
        console.log('📦 ProductDetail - Fetched product:', {
          name: data.product.name,
          id: data.product._id,
          rawImages: data.product.images,
          imageCount: data.product.images?.length || 0,
          firstImageUrl: getImageUrl(data.product.images?.[0]),
          apiBaseURL: api.defaults.baseURL
        });
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
    // Note: Ensure checkAuth logic matches your AuthContext (e.g., if it's a function)
    if (!checkAuth) {
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
      setQuantity(1);
    } catch (error) {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Loading Product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/shop')}
          className="group flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 lg:p-12">
            
            {/* Left: Gallery */}
            <div className="space-y-4 animate-slide-in-left">
              <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <img
                  key={`${product._id}-${selectedImage}-${product.images?.[selectedImage]}`}
                  src={getImageUrl(product.images?.[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    const failedUrl = getImageUrl(product.images?.[selectedImage]);
                    console.error('❌ ProductDetail - Failed to load main image:', {
                      productId: product._id,
                      imageIndex: selectedImage,
                      imagePath: product.images?.[selectedImage],
                      constructedUrl: failedUrl
                    });
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x400?text=No+Image';
                  }}
                  onLoad={() => {
                    console.log('✅ ProductDetail - Main image loaded:', getImageUrl(product.images?.[selectedImage]));
                  }}
                />
                
                {product.images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length); }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all pointer-events-auto"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => (prev + 1) % product.images.length); }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all pointer-events-auto"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </div>
                )}

                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-6 py-2 bg-white text-red-600 rounded-full font-bold shadow-xl border border-red-100">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-500 scale-95' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        key={`thumb-${idx}-${img}`}
                        src={getImageUrl(img)} 
                        className="w-full h-full object-cover" 
                        alt="thumbnail"
                        onError={(e) => {
                          console.error('❌ ProductDetail - Thumbnail failed:', getImageUrl(img));
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/80x80?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="flex flex-col animate-slide-in-right">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.quantity > 0 && product.quantity < 10 && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Low Stock
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center text-slate-500 font-medium">
                  <Tag className="w-4 h-4 mr-2 text-blue-500" />
                  {product.brand}
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-black text-blue-600">
                  LKR {(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Currently Unavailable'}
                </span>
              </div>

              <div className="space-y-6 flex-1">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed max-w-prose">
                    {product.description}
                  </p>
                </section>

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{key}</span>
                          <span className="text-slate-700 font-medium text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Purchase Section */}
              <div className="mt-10 pt-8 border-t border-slate-100">
                {product.quantity > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 text-slate-600 hover:bg-white hover:shadow-sm rounded-xl disabled:opacity-30 transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center font-bold text-lg text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                        className="p-3 text-slate-600 hover:bg-white hover:shadow-sm rounded-xl disabled:opacity-30 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all font-bold text-lg disabled:opacity-70"
                    >
                      {adding ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                      Add to Cart
                    </button>
                  </div>
                ) : (
                  <div className="w-full p-4 bg-red-50 border border-red-100 text-red-600 text-center rounded-2xl font-bold">
                    This item is currently out of stock.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;