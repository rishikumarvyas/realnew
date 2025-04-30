import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Home, Book, Shield, HelpCircle, Check, Eye, AlertCircle, Settings, FileText, ArrowRight } from 'lucide-react';

export default function EnhancedTermsAndConditions() {
  // State for animations and interactions
  const [activeSection, setActiveSection] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animatedElements, setAnimatedElements] = useState({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  
  const observerRef = useRef(null);
  
  // Animation on component mount and scroll effects
  useEffect(() => {
    setIsPageLoaded(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAnimatedElements(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, { threshold: 0.1 });
    
    // Observe all elements with animation-trigger class
    document.querySelectorAll('.animation-trigger').forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Terms & Conditions sections with enhanced content
  const sections = [
    {
      id: 'general',
      title: 'General Terms',
      icon: <Home className="text-indigo-600" />,
      content: `
        <p class="mb-4">Welcome to HomeYatra. By accessing or using our website, mobile application, or any of our services, you agree to be bound by these Terms and Conditions.</p>
        <p class="mb-4">HomeYatra provides a platform for users to search, list, and engage with real estate properties in India. Our services are designed to connect buyers, sellers, renters, and property managers.</p>
        <p>These terms constitute a legally binding agreement between you and HomeYatra. If you do not agree with any part of these terms, please do not use our services.</p>
      `
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      icon: <Shield className="text-indigo-600" />,
      content: `
        <p class="mb-4">To access certain features of our platform, you need to create a user account. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p class="mb-4">You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
        <p>HomeYatra reserves the right to suspend or terminate your account if any information provided proves to be inaccurate, outdated, or incomplete.</p>
      `
    },
    {
      id: 'property-listings',
      title: 'Property Listings',
      icon: <Book className="text-indigo-600" />,
      content: `
        <p class="mb-4">Property listings on HomeYatra are provided by users, real estate agents, and property owners. While we strive to maintain accurate listings, HomeYatra does not guarantee the accuracy of any listing information.</p>
        <p class="mb-4">By posting a property listing on HomeYatra, you represent and warrant that you have the right to list the property and that all information provided is accurate and complete.</p>
        <p>HomeYatra reserves the right to remove any listing at any time for any reason, including but not limited to violations of these Terms and Conditions.</p>
      `
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: <FileText className="text-indigo-600" />,
      content: `
        <p class="mb-4">All content on HomeYatra, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of HomeYatra or its content suppliers and is protected by Indian and international copyright laws.</p>
        <p class="mb-4">Users may not reproduce, distribute, display, sell, lease, transmit, create derivative works from, translate, modify, reverse-engineer, disassemble, decompile, or otherwise exploit the content without explicit permission from HomeYatra.</p>
        <p>Property images uploaded by users remain the property of their respective owners, with limited license granted to HomeYatra for display purposes.</p>
      `
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: <Eye className="text-indigo-600" />,
      content: `
        <p class="mb-4">Your privacy is important to us. Our Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.</p>
        <p class="mb-4">By using HomeYatra, you consent to the collection and use of information in accordance with our Privacy Policy, which is incorporated by reference into these Terms and Conditions.</p>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
      `
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertCircle className="text-indigo-600" />,
      content: `
        <p class="mb-4">HomeYatra is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.</p>
        <p class="mb-4">To the maximum extent permitted by law, HomeYatra shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
        <p>In no event shall HomeYatra's total liability to you for all claims exceed the amount paid by you, if any, for accessing and using our services during the twelve (12) months preceding your claim.</p>
      `
    },
    {  
      id: 'modifications',
      title: 'Modifications to Terms',
      icon: <Settings className="text-indigo-600" />,
      content: `
        <p class="mb-4">HomeYatra may revise these Terms and Conditions at any time without prior notice. By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised terms.</p>
        <p class="mb-4">It is your responsibility to check these Terms periodically for changes. Your continued use of the platform following the posting of revised Terms means that you accept and agree to the changes.</p>
        <p>We will notify registered users of significant changes to these terms via email or through a notification on our platform.</p>
      `
    }
  ];

  // Property banner images
  const propertyImages = [
    '/api/placeholder/800/500',
    '/api/placeholder/800/500',
    '/api/placeholder/800/500'
  ];

  // Toggle section display
  const toggleSection = (id) => {
    if (activeSection === id) {
      setActiveSection(null);
    } else {
      setActiveSection(id);
    }
  };
  
  // Calculate parallax effect for banner images
  const getParallaxStyle = (index) => {
    const offset = scrollY * (0.1 + (index * 0.05));
    return {
      transform: `translateY(${offset}px)`,
      opacity: 0.9 - (index * 0.1)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 font-sans transition-opacity duration-1000">
      
      {/* Hero Banner with Property Images */}
      <div className="relative overflow-hidden h-96">
        {/* Floating gradient shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-indigo-300 opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-400 opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-40 right-40 w-48 h-48 rounded-full bg-blue-300 opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Animated Property Images */}
        <div className="absolute inset-0 flex space-x-4 p-4 z-0">
          {propertyImages.map((image, index) => (
            <div 
              key={index}
              className={`flex-1 rounded-xl overflow-hidden transition-all duration-1000 transform ${
                isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              } hover:scale-105 hover:shadow-2xl hover:z-10`}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                ...getParallaxStyle(index)
              }}
            >
              <img 
                src={image} 
                alt={`Premium Property ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-800/90 to-indigo-600/90 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 h-full flex flex-col justify-center text-white text-center">
          <div 
            className={`inline-block mx-auto mb-6 p-3 rounded-full bg-indigo-500/30 backdrop-blur-md transition-all duration-1000 ${
              isPageLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
          >
            <FileText className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 transition-all duration-1000 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            Terms & Conditions
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            Please read these terms and conditions carefully before using the HomeYatra platform.
            By accessing our services, you agree to be bound by these terms.
          </p>
        </div>
        
        {/* Animated wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#f5f3ff" 
              fillOpacity="1" 
              d="M0,64L60,53.3C120,43,240,21,360,32C480,43,600,85,720,96C840,107,960,85,1080,74.7C1200,64,1320,64,1380,64L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-16 relative z-20">
        {/* Introduction Card */}
        <div 
          id="intro-section"
          className={`animation-trigger bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-16 transition-all duration-1000 ${
            animatedElements['intro-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center md:space-x-6 mb-6">
            <div className="bg-indigo-100 p-4 rounded-xl mb-4 md:mb-0">
              <Shield className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2 text-center md:text-left">Legal Agreement</h3>
              <p className="text-indigo-600 text-lg text-center md:text-left">Understanding Your Rights and Responsibilities</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4 text-lg">
            These Terms and Conditions govern your use of the HomeYatra platform and services. Our mission is to provide a transparent, 
            efficient, and trustworthy marketplace for real estate transactions in India, connecting property seekers with property 
            owners and real estate professionals.
          </p>
          <p className="text-gray-700 text-lg">
            By creating an account, listing a property, or using any of our services, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms. If you do not agree to these Terms, you should not use our platform.
          </p>
          
          {/* Key principles cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { icon: <Shield className="h-6 w-6 text-indigo-600" />, text: "Security" },
              { icon: <Eye className="h-6 w-6 text-indigo-600" />, text: "Privacy" },
              { icon: <Check className="h-6 w-6 text-indigo-600" />, text: "Compliance" },
              { icon: <AlertCircle className="h-6 w-6 text-indigo-600" />, text: "Integrity" }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-indigo-50 rounded-xl p-4 flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-indigo-100 hover:shadow-md"
              >
                {item.icon}
                <span className="font-medium text-indigo-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Terms & Conditions Sections */}
        <div className="space-y-6 mb-16">
          {sections.map((section, index) => (
            <div 
              key={section.id}
              id={`section-${section.id}`}
              className={`animation-trigger bg-white/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform ${
                animatedElements[`section-${section.id}`] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              } hover:shadow-xl border border-indigo-100`}
              style={{ transitionDelay: `${150 + (index * 100)}ms` }}
            >
              <button 
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => toggleSection(section.id)}
                aria-expanded={activeSection === section.id}
                aria-controls={`content-${section.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">{section.title}</h3>
                </div>
                <ChevronDown 
                  className={`text-indigo-600 transition-transform duration-300 ${
                    activeSection === section.id ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              <div 
                id={`content-${section.id}`}
                className={`transition-all duration-500 overflow-hidden ${
                  activeSection === section.id 
                    ? 'max-h-screen opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
                aria-hidden={activeSection !== section.id}
              >
                <div className="px-6 pb-6 border-t border-indigo-100 pt-4">
                  <div 
                    className="prose prose-indigo text-gray-700"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Agreement Section */}
        <div 
          id="agreement-section"
          className={`animation-trigger bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-lg p-8 mb-16 transition-all duration-1000 ${
            animatedElements['agreement-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-8 text-center">Your Acceptance</h3>
          
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <div 
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    agreementChecked 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}
                  onClick={() => setAgreementChecked(!agreementChecked)}
                  role="checkbox"
                  aria-checked={agreementChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setAgreementChecked(!agreementChecked);
                    }
                  }}
                >
                  {agreementChecked && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
              <div>
                <p className="text-gray-700">
                  I confirm that I have read, understood, and agree to be bound by HomeYatra's Terms and Conditions and Privacy Policy.
                  I understand that these terms form a legally binding agreement between myself and HomeYatra.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              className={`px-8 py-4 rounded-xl font-medium shadow-lg flex items-center space-x-2 transition-all duration-300 transform ${
                agreementChecked 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!agreementChecked}
            >
              <span>I Accept the Terms</span>
              {agreementChecked && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Last Updated with Decorative Element */}
        <div 
          id="updated-section"
          className={`animation-trigger text-center mb-16 transition-all duration-1000 ${
            animatedElements['updated-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <div className="inline-flex items-center">
            <div className="h-px w-12 bg-indigo-300"></div>
            <p className="px-4 text-indigo-600 font-medium">Last Updated: April 30, 2025</p>
            <div className="h-px w-12 bg-indigo-300"></div>
          </div>
        </div>
      </main>
      
      {/* Footer with wave */}
      <div className="relative mt-20">
        {/* Top wave */}
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#4338ca" 
              fillOpacity="0.9" 
              d="M0,96L60,80C120,64,240,32,360,32C480,32,600,64,720,80C840,96,960,96,1080,80C1200,64,1320,32,1380,16L1440,0L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
        
       
      </div>
    </div>
  );
}