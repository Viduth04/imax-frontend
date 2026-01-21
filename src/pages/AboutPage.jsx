import React from 'react';
import {
  Users, Award, Shield, Truck, HeadphonesIcon, Cpu,
  Monitor, HardDrive, Settings, Star, CheckCircle,
  MapPin, Clock, Phone, Mail, ArrowRight, Target,
  Heart, Zap, Globe
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '5000+', label: 'Happy Customers', icon: Users },
    { number: '10+', label: 'Years Experience', icon: Award },
    { number: '24/7', label: 'Support Available', icon: HeadphonesIcon },
    { number: '99%', label: 'Customer Satisfaction', icon: Star }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Every product undergoes rigorous testing to ensure the highest quality standards.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Island-wide delivery with secure packaging and real-time tracking.'
    },
    {
      icon: HeadphonesIcon,
      title: 'Expert Support',
      description: 'Certified technicians provide professional advice and technical support.'
    },
    {
      icon: Award,
      title: 'Certified Products',
      description: 'Only genuine, certified products from trusted manufacturers.'
    }
  ];

  const team = [
    {
      name: 'Chamika Fernando',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150',
      bio: '15+ years in computer hardware with a passion for empowering Sri Lankans with quality tech.'
    },
    {
      name: 'Nirosha Perera',
      position: 'Technical Director',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=150',
      bio: 'Certified PC building expert with extensive experience in custom system assembly.'
    },
    {
      name: 'Ruwan Silva',
      position: 'Sales Manager',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150',
      bio: 'Dedicated to providing personalized service and helping customers find the perfect components.'
    }
  ];

  const services = [
    {
      icon: Settings,
      title: 'Custom PC Building',
      description: 'Expert assembly of custom gaming and workstation PCs tailored to your needs.'
    },
    {
      icon: Cpu,
      title: 'Component Sales',
      description: 'Wide range of processors, motherboards, RAM, and storage solutions.'
    },
    {
      icon: Monitor,
      title: 'Display Solutions',
      description: 'Gaming monitors, professional displays, and accessories.'
    },
    {
      icon: HardDrive,
      title: 'Storage Systems',
      description: 'SSDs, HDDs, NVMe drives, and RAID solutions.'
    }
  ];

  const milestones = [
    { year: '2014', event: 'IMAX Computer Parts founded in Colombo' },
    { year: '2016', event: 'Expanded to island-wide delivery service' },
    { year: '2018', event: 'Opened technical support center' },
    { year: '2020', event: 'Launched custom PC building service' },
    { year: '2022', event: 'Became Sri Lanka\'s leading PC components retailer' },
    { year: '2024', event: 'Introduced 24/7 technical support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              About IMAX Computer Parts
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed animate-fade-in">
              Sri Lanka's premier destination for premium computer components,
              expert PC building, and unparalleled technical support since 2014.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Founded in 2014, IMAX Computer Parts began as a small shop in Colombo with a simple mission:
                  to provide Sri Lankans with access to genuine, high-quality computer components at fair prices.
                </p>
                <p>
                  What started as a passion project quickly grew into Sri Lanka's most trusted name in computer hardware.
                  We've built our reputation on three core principles: quality, expertise, and customer satisfaction.
                </p>
                <p>
                  Today, we serve thousands of customers across the island, from gaming enthusiasts to professional workstations,
                  from startups to established businesses. Our commitment to excellence drives everything we do.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center text-slate-700">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium">Quality First</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Heart className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-medium">Customer Focused</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-medium">Expert Service</span>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="IMAX Store Interior"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
              Our Values
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-in">
              The principles that guide our business and shape our relationships with customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-all duration-300 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
              What We Offer
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-in">
              Comprehensive computer solutions for every need and budget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline/Milestones */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
              Our Journey
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-in">
              Key milestones in our growth and commitment to serving Sri Lanka's tech community.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>

              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'pr-8 md:pr-12' : 'pl-8 md:pl-12'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <p className="text-slate-700 font-medium">{milestone.event}</p>
                    </div>
                  </div>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
              Meet Our Team
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-in">
              The passionate experts behind IMAX Computer Parts who make the difference every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.position}</p>
                <p className="text-slate-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Globe className="w-16 h-16 text-blue-200 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Our Mission
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed mb-8 animate-fade-in">
              To empower Sri Lanka's digital transformation by providing access to world-class computer technology,
              expert guidance, and exceptional service that builds lasting relationships and drives innovation across our island nation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center animate-fade-in-up">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Genuine Products</h3>
                <p className="text-blue-100">Only authentic, certified components from trusted manufacturers</p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <Users className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
                <p className="text-blue-100">Professional advice from certified technicians and PC builders</p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Customer First</h3>
                <p className="text-blue-100">Your satisfaction and success is our top priority</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Start Your PC Build?
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Visit us today or contact our experts for personalized recommendations
              and professional PC building services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Browse Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;