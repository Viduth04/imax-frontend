import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, AlertCircle, Laptop, Cpu, Settings, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .required('Password is required')
  });

  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general and field errors as user types for better UX
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.general;
      delete newErrors[name];
      return newErrors;
    });

    if (touched[name]) {
      await validateField(name, value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setFocusedInput('');
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true
    });

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setLoading(true);
      
      // Auth logic execution
      await login(formData.email, formData.password, rememberMe);
    } catch (error) {
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Login error:', error);
        setErrors({ 
          general: error.response?.data?.message || 'Invalid email or password. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Access your service dashboard',
    'Track computer repair requests',
    'Browse latest technology products',
    'Manage your IMAX service history'
  ];

  const stats = [
    { label: 'Happy Customers', value: '15K+', icon: Users },
    { label: 'Customer Rating', value: '4.9★', icon: Star },
    { label: 'Service Locations', value: '50+', icon: Monitor }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Tech Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <defs>
              <pattern id="circuit" patternUnits="userSpaceOnUse" width="100" height="100">
                <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="3" fill="currentColor"/>
                <circle cx="80" cy="20" r="3" fill="currentColor"/>
                <circle cx="80" cy="80" r="3" fill="currentColor"/>
                <circle cx="20" cy="80" r="3" fill="currentColor"/>
                <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="1"/>
                <path d="M20,50 L80,50" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        {/* Floating Tech Elements */}
        <div className="absolute inset-0 opacity-15">
          <Monitor className="absolute top-20 left-20 w-16 h-16 animate-pulse" />
          <Laptop className="absolute bottom-40 right-16 w-12 h-12 animate-bounce" style={{animationDelay: '1s'}} />
          <Cpu className="absolute top-1/2 right-32 w-14 h-14 animate-pulse" style={{animationDelay: '2s'}} />
          <Settings className="absolute top-1/3 left-1/2 w-10 h-10 animate-spin" style={{animationDuration: '8s'}} />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center text-white mb-20 group">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mr-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-bold block">IMAX</span>
              <span className="text-blue-100 text-sm">Computer Solutions Sri Lanka</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Welcome back to
                <span className="block text-blue-100">your tech dashboard</span>
              </h1>
              <p className="text-xl text-blue-50 leading-relaxed">
                Sign in to access your IMAX account and manage your computer service requests across Sri Lanka.
              </p>
            </div>
            
            <div className="pt-8 space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-white group">
                  <div className="p-1.5 bg-blue-400 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-4 h-4 text-blue-800" />
                  </div>
                  <span className="text-blue-50">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-blue-400/30">
              <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between text-blue-100 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-blue-300" />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-blue-100">
          <p className="text-sm">
            © 2026 IMAX Computer Solutions. Your trusted technology partner.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center text-blue-600 group">
              <div className="p-2 bg-blue-100 rounded-xl mr-3 group-hover:bg-blue-200 transition-all duration-300">
                <Monitor className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold block">IMAX</span>
                <span className="text-blue-600 text-xs">Computer Solutions Sri Lanka</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Welcome back!
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Sign in to access your IMAX dashboard
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'email' ? 'text-blue-600' : errors.email && touched.email ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-4 py-3 sm:py-4 border-2 ${
                    errors.email && touched.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : focusedInput === 'email' 
                        ? 'border-blue-500 bg-blue-50/30' 
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  placeholder="Enter your email address"
                />
                <label className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'email' ? 'text-blue-600' : errors.email && touched.email ? 'text-red-500' : 'text-slate-600'
                }`}>
                  Email Address
                </label>
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'password' ? 'text-blue-600' : errors.password && touched.password ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-12 py-3 sm:py-4 border-2 ${
                    errors.password && touched.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : focusedInput === 'password' 
                        ? 'border-blue-500 bg-blue-50/30' 
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  placeholder="Enter your password"
                />
                <label className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'password' ? 'text-blue-600' : errors.password && touched.password ? 'text-red-500' : 'text-slate-600'
                }`}>
                  Password
                </label>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-slate-300 rounded"
                  />
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-800">
                    Remember me for 30 days
                  </span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm text-blue-600 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? 'Signing you in...' : (
                  <>Access Your Dashboard <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                New to IMAX? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Join our community →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;