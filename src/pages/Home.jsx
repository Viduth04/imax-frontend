import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, CheckCircle, ArrowRight, Monitor, Truck, 
  Settings, Laptop, Wifi, Package, Star, MapPin, Phone, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Img1 from '../assets/image1.jpg'
import Img2 from '../assets/image2.jpg'
import Img3 from '../assets/image3.jpg'

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
      title: 'Premium Computer Parts',
      subtitle: 'Build your dream PC with top-quality components and hardware'
    },
    {
      url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Latest PC Components',
      subtitle: 'CPUs, GPUs, RAM, Motherboards & More - Everything for your build'
    },
    {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Expert PC Building',
      subtitle: 'Get professional advice and support for your custom PC build'
    }
  ];

  // Auto-slide effect logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const features = [
    { icon: Settings, title: 'Expert Repairs', description: 'Professional computer and laptop repair services with certified technicians' },
    { icon: Monitor, title: 'Sales & Installation', description: 'Wide range of computers, laptops, and accessories with professional setup' },
    { icon: Truck, title: 'Island-wide Service', description: 'Fast delivery and on-site service across all provinces in Sri Lanka' },
    { icon: Shield, title: 'Warranty Guaranteed', description: 'All products and services come with comprehensive warranty coverage' }
  ];

  const serviceCategories = [
    {
      name: 'Processors & CPU',
      icon: Settings,
      items: ['Intel Processors', 'AMD Ryzen CPUs', 'CPU Coolers', 'Thermal Paste'],
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      name: 'Graphics Cards',
      icon: Monitor,
      items: ['NVIDIA RTX Series', 'AMD Radeon GPUs', 'Gaming Cards', 'Workstation GPUs'],
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80'
    },
    {
      name: 'Memory & Storage',
      icon: Package,
      items: ['DDR4/DDR5 RAM', 'SSD Drives', 'NVMe M.2', 'HDD Storage'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      name: 'Motherboards & Cases',
      icon: Laptop,
      items: ['ATX Motherboards', 'Mini-ITX Boards', 'PC Cases', 'RGB Cases'],
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  ];

  const serviceProcess = [
    { step: 1, title: 'Browse Products', description: 'Explore our wide range of computer parts and components' },
    { step: 2, title: 'Select Components', description: 'Choose the perfect parts for your PC build needs' },
    { step: 3, title: 'Order & Delivery', description: 'Fast shipping across Sri Lanka with secure payment' },
    { step: 4, title: 'Build Your PC', description: 'Get expert advice and support for your custom build' }
  ];

  const testimonials = [
    {
      name: 'Pradeep Silva',
      rating: 5,
      comment: 'Excellent service! They fixed my laptop quickly and the price was very reasonable. Highly recommended!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150'
    },
    {
      name: 'Nirosha Fernando',
      rating: 5,
      comment: 'Best computer shop in Colombo! Great customer service and genuine products with warranty.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=150'
    },
    {
      name: 'Kasun Perera',
      rating: 5,
      comment: 'Professional team with excellent technical knowledge. They solved my network issues perfectly.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      
      {/* Hero Section - Logic updated to use currentSlide */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={img.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-left leading-tight animate-slide-in-left">
              {heroImages[currentSlide].title}
            </h1>
            <p className="text-xl md:text-3xl mb-10 text-left text-gray-200 animate-slide-in-right">
              {heroImages[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/shop'}
                  className="inline-flex items-center px-10 py-5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                >
                  Browse Products
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/shop"
                    className="inline-flex items-center px-10 py-5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 border-2 border-white/30 text-lg"
                  >
                    Browse Products
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-4 animate-fade-in">
            Why Choose IMAX Computer Parts?
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-2xl mx-auto animate-fade-in">
            Your one-stop shop for premium computer components and expert PC building support
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-4 animate-fade-in">
            Our Product Categories
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-2xl mx-auto animate-fade-in">
            Everything you need to build your dream PC - from processors to peripherals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      <category.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="text-slate-600 text-sm flex items-center group-hover:text-slate-700 transition-colors">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-4 animate-fade-in">
            How We Work
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-2xl mx-auto animate-fade-in">
            Simple steps to get the perfect components for your PC build
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceProcess.map((step, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 text-2xl font-extrabold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
                {index < serviceProcess.length - 1 && (
                  <ArrowRight className="hidden lg:block w-8 h-8 text-blue-500 mx-auto mt-6 group-hover:translate-x-2 transition-transform duration-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/90 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info (Simplified for consistency) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Visit Us</h3>
                <p className="text-slate-600 text-sm">123 Galle Road, Colombo 03</p>
              </div>
              <div>
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Call Us</h3>
                <p className="text-slate-600 text-sm">+94 11 234 5678</p>
              </div>
              <div>
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Email Us</h3>
                <p className="text-slate-600 text-sm">info@imaxcomputers.lk</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;