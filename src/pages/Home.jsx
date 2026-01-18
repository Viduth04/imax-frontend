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
      url: Img1,
      title: 'Expert Computer Solutions',
      subtitle: 'Professional IT services and sales across Sri Lanka'
    },
    {
      url: Img2,
      title: 'Latest Technology',
      subtitle: 'Cutting-edge computers, laptops, and accessories'
    },
    {
      url: Img3,
      title: 'Reliable Support',
      subtitle: '24/7 technical support for all your IT needs'
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
      name: 'Computer Repair',
      icon: Monitor,
      items: ['Hardware Repair', 'Software Installation', 'Virus Removal', 'Data Recovery'],
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3'
    },
    {
      name: 'Laptop Services',
      icon: Laptop,
      items: ['Screen Replacement', 'Battery Replacement', 'Keyboard Repair', 'Performance Upgrade'],
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3'
    },
    {
      name: 'Network Solutions',
      icon: Wifi,
      items: ['WiFi Setup', 'Network Configuration', 'Router Installation', 'Cable Management'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3'
    },
    {
      name: 'Sales & Accessories',
      icon: Package,
      items: ['Desktop Computers', 'Laptops', 'Printers', 'Storage Devices'],
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3'
    }
  ];

  const serviceProcess = [
    { step: 1, title: 'Contact Us', description: 'Call or visit our service center for consultation' },
    { step: 2, title: 'Diagnosis', description: 'Free diagnosis and detailed cost estimation' },
    { step: 3, title: 'Repair/Install', description: 'Professional service by certified technicians' },
    { step: 4, title: 'Quality Check', description: 'Thorough testing and warranty coverage' }
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
          <img
            src={heroImages[currentSlide].url}
            alt={heroImages[currentSlide].title}
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-left">
              {heroImages[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-left">
              {heroImages[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/services'}
                  className="inline-flex items-center px-8 py-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/services"
                    className="inline-flex items-center px-8 py-4 bg-white text-slate-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View Services
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            Why Choose IMAX Computer Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            Our Services
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Comprehensive IT solutions from expert repairs to latest technology sales across Sri Lanka
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <category.icon className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                  </div>
                  <ul className="space-y-1">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="text-slate-600 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        {item}
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            How We Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceProcess.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
                {index < serviceProcess.length - 1 && (
                  <ArrowRight className="hidden lg:block w-8 h-8 text-blue-500 mx-auto mt-4" />
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