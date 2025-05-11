import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  ChevronDown,
  User,
  Mail,
  MessageSquare,
  ArrowRight,
  Info,
  Check,
  X,
} from "lucide-react";

export default function EnhancedPrivacyPolicy() {
  // State for animations and interactions
  const [activeSection, setActiveSection] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [animatedElements, setAnimatedElements] = useState({});

  const observerRef = useRef(null);
  const elementsRef = useRef({});

  // Handle page load animation
  useEffect(() => {
    setIsPageLoaded(true);

    // Show notification after page load
    setTimeout(() => {
      setShowNotification(true);
    }, 2000);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 7000);

    // Scroll effects
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with animation-trigger class
    document.querySelectorAll(".animation-trigger").forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Privacy Policy sections
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Database className="text-indigo-600" />,
      content: `
        <p>HomeYatra collects several types of information from and about users of our website and services, including:</p>
        <ul class="list-disc pl-5 space-y-2 mt-2">
          <li>Personal information such as name, email address, phone number, and postal address when you register for an account.</li>
          <li>Property preferences and search history when you browse available properties.</li>
          <li>Financial information when you engage in transactions through our platform.</li>
          <li>Technical data including IP address, browser type, device information, and cookies.</li>
        </ul>
      `,
    },
    {
      id: "information-usage",
      title: "How We Use Your Information",
      icon: <Eye className="text-indigo-600" />,
      content: `
        <p>We use the information we collect to:</p>
        <ul class="list-disc pl-5 space-y-2 mt-2">
          <li>Provide, operate, and maintain our website and services.</li>
          <li>Connect you with relevant property listings and real estate professionals.</li>
          <li>Process transactions and send related information including confirmations and invoices.</li>
          <li>Send administrative information, such as updates to our terms, conditions, and policies.</li>
          <li>Personalize your experience by delivering content tailored to your interests.</li>
          <li>Improve our website and services through data analysis and research.</li>
        </ul>
      `,
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: <User className="text-indigo-600" />,
      content: `
        <p>HomeYatra may share your personal information with:</p>
        <ul class="list-disc pl-5 space-y-2 mt-2">
          <li>Property owners or managers when you express interest in a specific property.</li>
          <li>Real estate agents and brokers to facilitate property transactions.</li>
          <li>Service providers who perform services on our behalf, such as payment processing or customer service.</li>
          <li>Legal authorities when required by law or to protect our rights and safety.</li>
        </ul>
        <p>We do not sell your personal information to third parties for marketing purposes without your explicit consent.</p>
      `,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="text-indigo-600" />,
      content: `
        <p>HomeYatra implements appropriate technical and organizational measures to protect your personal information, including:</p>
        <ul class="list-disc pl-5 space-y-2 mt-2">
          <li>Encryption of sensitive data using industry-standard protocols.</li>
          <li>Regular security assessments and vulnerability testing.</li>
          <li>Access controls and authentication mechanisms to prevent unauthorized access.</li>
          <li>Employee training on data protection and privacy best practices.</li>
        </ul>
        <p>While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
      `,
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: <Bell className="text-indigo-600" />,
      content: `
        <p>HomeYatra uses cookies and similar tracking technologies to:</p>
        <ul class="list-disc pl-5 space-y-2 mt-2">
          <li>Remember your preferences and settings.</li>
          <li>Understand how you interact with our website.</li>
          <li>Personalize content and advertisements.</li>
          <li>Analyze website traffic and performance.</li>
        </ul>
        <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.</p>
      `,
    },
  ];

  // Premium property images for the background and animation
  const propertyImages = [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ];

  // Toggle section display
  const toggleSection = (id) => {
    if (activeSection === id) {
      setActiveSection(null);
    } else {
      setActiveSection(id);
    }
  };

  // Calculate parallax effect for images
  const getParallaxStyle = (index) => {
    const offset = scrollPosition * (0.1 + index * 0.05);
    return {
      transform: `translateY(${offset}px)`,
      opacity: 0.85 - index * 0.05,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 font-sans transition-opacity duration-1000 overflow-hidden">
      {/* Floating notification */}
      <div
        className={`fixed bottom-8 right-8 bg-indigo-800 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center space-x-3 transition-all duration-500 transform ${
          showNotification
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <Shield className="h-6 w-6" />
        <p>We value your privacy. Learn how we protect your data.</p>
        <button
          className="ml-4 hover:bg-indigo-700 p-1 rounded-full"
          onClick={() => setShowNotification(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Section with Premium Property Images */}
      <div className="relative overflow-hidden h-screen lg:h-96">
        {/* Floating gradient shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-300 opacity-20 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-indigo-400 opacity-20 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 right-40 w-48 h-48 rounded-full bg-blue-300 opacity-20 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Animated Property Images Grid */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 z-0">
          {propertyImages.map((image, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden transition-all duration-1000 transform ${
                isPageLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } hover:scale-105 hover:shadow-2xl hover:z-10`}
              style={{
                transitionDelay: `${index * 200}ms`,
                ...getParallaxStyle(index),
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
              isPageLoaded ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <Shield className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1
            className={`text-4xl md:text-6xl font-bold mb-4 transition-all duration-1000 ${
              isPageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            Privacy Policy
          </h1>
          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              isPageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            We value your privacy and are committed to protecting your personal
            information. Learn how we collect, use, and safeguard your data.
          </p>
          <div
            className={`mt-8 transition-all duration-1000 delay-500 ${
              isPageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <button className="bg-white text-indigo-800 font-medium px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2 mx-auto">
              <span>Read Full Policy</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Animated wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#f5f3ff"
              fillOpacity="1"
              d="M0,96L60,80C120,64,240,32,360,32C480,32,600,64,720,80C840,96,960,96,1080,80C1200,64,1320,32,1380,16L1440,0L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-16 relative z-20">
        {/* Introduction */}
        <div
          id="intro-section"
          className={`animation-trigger bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-16 transition-all duration-1000 ${
            animatedElements["intro-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center md:space-x-6 mb-6">
            <div className="bg-indigo-100 p-4 rounded-xl mb-4 md:mb-0">
              <Shield className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2 text-center md:text-left">
                Your Data Protection Rights
              </h3>
              <p className="text-indigo-600 text-lg text-center md:text-left">
                Transparency, Security, and Control
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-4 text-lg">
            At HomeYatra, we are dedicated to helping you find your dream home
            while respecting and protecting your privacy. This Privacy Policy
            explains how we collect, use, and protect your personal information
            when you use our website and services.
          </p>
          <p className="text-gray-700 text-lg">
            This policy applies to all users of HomeYatra, including property
            buyers, sellers, renters, landlords, and real estate professionals.
            By using our services, you consent to the practices described in
            this policy.
          </p>

          {/* Key principles cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                icon: <Info className="h-6 w-6 text-indigo-600" />,
                text: "Transparency",
              },
              {
                icon: <Lock className="h-6 w-6 text-indigo-600" />,
                text: "Security",
              },
              {
                icon: <Check className="h-6 w-6 text-indigo-600" />,
                text: "Control",
              },
              {
                icon: <Shield className="h-6 w-6 text-indigo-600" />,
                text: "Protection",
              },
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

        {/* Privacy Policy sections */}
        <div className="space-y-6 mb-16">
          {sections.map((section, index) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className={`animation-trigger bg-white/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform ${
                animatedElements[`section-${section.id}`]
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } hover:shadow-xl`}
              style={{ transitionDelay: `${150 + index * 100}ms` }}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">
                    {section.title}
                  </h3>
                </div>
                <ChevronDown
                  className={`text-indigo-600 transition-transform duration-300 ${
                    activeSection === section.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-500 overflow-hidden ${
                  activeSection === section.id
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0"
                }`}
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

        {/* Your Rights Section with Cards */}
        <div
          id="rights-section"
          className={`animation-trigger bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-lg p-8 mb-16 transition-all duration-1000 ${
            animatedElements["rights-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-8 text-center">
            Your Rights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Access and Correction",
                description:
                  "You have the right to access and update your personal information stored in our systems.",
                icon: <Eye className="h-6 w-6 text-indigo-600" />,
              },
              {
                title: "Data Portability",
                description:
                  "You can request a copy of your data in a structured, commonly used format.",
                icon: <Database className="h-6 w-6 text-indigo-600" />,
              },
              {
                title: "Deletion",
                description:
                  "You can request the deletion of your personal information in certain circumstances.",
                icon: <X className="h-6 w-6 text-indigo-600" />,
              },
              {
                title: "Opt-Out",
                description:
                  "You can opt out of marketing communications and certain data processing activities.",
                icon: <Bell className="h-6 w-6 text-indigo-600" />,
              },
            ].map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    {card.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-indigo-800">
                    {card.title}
                  </h4>
                </div>
                <p className="text-gray-700">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated with Decorative Element */}
        <div
          id="updated-section"
          className={`animation-trigger text-center mb-16 transition-all duration-1000 ${
            animatedElements["updated-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <div className="inline-flex items-center">
            <div className="h-px w-12 bg-indigo-300"></div>
            <p className="px-4 text-indigo-600 font-medium">
              Last Updated: April 30, 2025
            </p>
            <div className="h-px w-12 bg-indigo-300"></div>
          </div>
        </div>

        {/* Enhanced Contact Form with Animation */}
        <div
          id="contact-section"
          className={`animation-trigger bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 transition-all duration-1000 ${
            animatedElements["contact-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2">
              Privacy Questions?
            </h3>
            <p className="text-indigo-600">
              We're here to help with any privacy concerns you may have
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-800 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-indigo-800 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                placeholder="What is your question about?"
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-indigo-800 mb-1">
                Your Message
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                placeholder="Please describe your privacy concern or question..."
              ></textarea>
            </div>
            <div className="flex justify-center">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2">
                <span>Submit Question</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with wave */}
      <div className="relative mt-20">
        {/* Top wave */}
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#4338ca"
              fillOpacity="0.9"
              d="M0,64L60,80C120,96,240,128,360,122.7C480,117,600,75,720,64C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
