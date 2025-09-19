import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Award,
  ThumbsUp,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Home,
  Star,
  ArrowRight,
} from "lucide-react";

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState({
    banner: false,
    mission: false,
    stats: false,
    team: false,
    history: false,
    testimonials: false,
    contact: false,
  });

  const [isInView, setIsInView] = useState({
    banner: false,
    mission: false,
    stats: false,
    team: false,
    history: false,
    testimonials: false,
    contact: false,
  });

  useEffect(() => {
    // Set elements to visible with a staggered delay initially
    const timers = [
      setTimeout(
        () => setIsVisible((prev) => ({ ...prev, banner: true })),
        300,
      ),
      setTimeout(
        () => setIsVisible((prev) => ({ ...prev, mission: true })),
        600,
      ),
      setTimeout(() => setIsVisible((prev) => ({ ...prev, stats: true })), 900),
      setTimeout(() => setIsVisible((prev) => ({ ...prev, team: true })), 1200),
      setTimeout(
        () => setIsVisible((prev) => ({ ...prev, history: true })),
        1500,
      ),
      setTimeout(
        () => setIsVisible((prev) => ({ ...prev, testimonials: true })),
        1800,
      ),
      setTimeout(
        () => setIsVisible((prev) => ({ ...prev, contact: true })),
        2100,
      ),
    ];

    // Set up intersection observers for scroll-based animations
    const observers = [];

    const sections = [
      { id: "banner", selector: ".banner-section" },
      { id: "mission", selector: ".mission-section" },
      { id: "stats", selector: ".stats-section" },
      { id: "team", selector: ".team-section" },
      { id: "history", selector: ".history-section" },
      { id: "testimonials", selector: ".testimonials-section" },
      { id: "contact", selector: ".contact-section" },
    ];

    sections.forEach((section) => {
      const element = document.querySelector(section.selector);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView((prev) => ({ ...prev, [section.id]: true }));
              } else {
                setIsInView((prev) => ({ ...prev, [section.id]: false }));
              }
            });
          },
          { threshold: 0.2 },
        );

        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const StatBox = ({ icon, number, title }) => (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 border-t-4 border-blue-500">
      <div className="mb-4 p-4 rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <h3 className="text-4xl font-bold text-gray-800 mb-2">{number}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
    </div>
  );

  const TeamMember = ({ name, position, image }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl group">
      <div className="h-64 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-6 border-t-2 border-blue-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-blue-600 font-medium">{position}</p>
        <div className="mt-4 flex space-x-3">
          <a
            href="#"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h21.35c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0zm-3.999 7.955a8.05 8.05 0 01-2.32.635 4.046 4.046 0 001.775-2.233 8.07 8.07 0 01-2.57.98A4.026 4.026 0 0011.55 9.64a11.425 11.425 0 01-8.29-4.2 4.025 4.025 0 001.245 5.37 4.002 4.002 0 01-1.82-.504v.05a4.025 4.025 0 003.23 3.943 4.03 4.03 0 01-1.815.069A4.026 4.026 0 007.835 17.1a8.087 8.087 0 01-5.845 1.626 11.397 11.397 0 006.175 1.81c7.41 0 11.46-6.13 11.46-11.457 0-.175-.004-.348-.012-.52a8.193 8.193 0 002.008-2.089l.005-.005z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm3.92 6.12h-2.61c-.2 0-.35.05-.35.21V9.5h2.96v2H12.96v7H9.76v-7h-2v-1.5h2v-1c0-1.5 1-2.5 2.5-2.5h3.42v1.33z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );

  const TestimonialCard = ({ quote, author, position, image }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <img
            src={image}
            alt={author}
            className="w-16 h-16 rounded-full object-cover shadow-md"
          />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-800">{author}</h4>
          <p className="text-blue-600">{position}</p>
        </div>
      </div>
      <div className="relative flex-grow">
        <svg
          className="absolute -top-4 -left-2 w-8 h-8 text-blue-200"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M7.031 14c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7l-0.031-1c0-7.732 6.268-14 14-14v4c-2.671 0-5.182 1.040-7.071 2.929-0.364 0.364-0.695 0.751-0.995 1.157 0.357-0.056 0.724-0.086 1.097-0.086zM25.031 14c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7l-0.031-1c0-7.732 6.268-14 14-14v4c-2.671 0-5.182 1.040-7.071 2.929-0.364 0.364-0.695 0.751-0.995 1.157 0.358-0.056 0.724-0.086 1.097-0.086z"></path>
        </svg>
        <p className="text-gray-600 italic pl-6">{quote}</p>
      </div>
      <div className="mt-4 flex text-yellow-400">
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
      </div>
    </div>
  );

  const PropertyCard = ({
    title,
    description,
    price,
    image,
    tag,
    tagColor,
  }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 group">
      <div className="relative h-64">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className={`absolute top-4 right-4 ${tagColor} text-white px-3 py-1 rounded-md font-medium`}
        >
          {tag}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-blue-600">{price}</span>
          <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center group">
            View Details
            <ChevronRight
              size={16}
              className="ml-1 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );

  const animateClass = (elementName) =>
    isVisible[elementName] && isInView[elementName]
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-10";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div
        className={`banner-section relative h-screen max-h-[700px] overflow-hidden transition-all duration-1000 ${animateClass(
          "banner",
        )}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-70"></div>
        <img
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
          alt="Luxury property"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="animate-fadeIn">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl leading-tight">
                Welcome to <span className="text-blue-300">Home</span>Yatra
              </h1>
              <p className="text-xl md:text-2xl text-white max-w-xl mb-8">
                Your trusted partner in finding the perfect home across India
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-md font-medium flex items-center group transition-all duration-300 transform hover:scale-105">
                Explore Properties
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <section
        className={`mission-section py-16 md:py-24 container mx-auto px-6 transition-all duration-1000 transform ${animateClass(
          "mission",
        )}`}
      >
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-16 mb-10 md:mb-0">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              At HomeYatra, we believe everyone deserves to find their perfect
              home. Our mission is to simplify the real estate journey by
              providing transparent information, personalized guidance, and
              innovative technology that empowers our clients to make confident
              decisions.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded in 2015, we've helped thousands of families and
              individuals discover properties that feel like home across all
              major cities in India. Our approach combines deep local expertise
              with cutting-edge technology to create a seamless home-finding
              experience.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                alt="Luxury Property Interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`stats-section py-16 md:py-24 bg-gradient-to-r from-blue-50 to-white transition-all duration-1000 transform ${animateClass(
          "stats",
        )}`}
      >
        <div className="container mx-auto px-6">
          <span className="block text-center text-blue-600 font-semibold mb-4">
            THE NUMBERS SPEAK
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBox
              icon={<Building2 size={28} />}
              number="10,000+"
              title="Properties Listed"
            />
            <StatBox
              icon={<Users size={28} />}
              number="5,000+"
              title="Happy Families"
            />
            <StatBox
              icon={<Award size={28} />}
              number="25+"
              title="Cities Covered"
            />
            <StatBox
              icon={<ThumbsUp size={28} />}
              number="98%"
              title="Client Satisfaction"
            />
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section
        className={`team-section py-16 md:py-24 container mx-auto px-6 transition-all duration-1000 transform ${animateClass(
          "team",
        )}`}
      >
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            THE EXPERTS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Meet Our Leadership
          </h2>
          <p className="text-lg text-gray-600">
            Our diverse team of real estate experts is dedicated to helping you
            find your dream home
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <TeamMember
            name="Rajiv Sharma"
            position="CEO & Founder"
            image="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
          />
          <TeamMember
            name="Priya Patel"
            position="Chief Operations Officer"
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=388&q=80"
          />
          <TeamMember
            name="Arjun Mehta"
            position="Head of Technology"
            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
          />
          <TeamMember
            name="Neha Gupta"
            position="Customer Success Director"
            image="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
          />
        </div>
      </section>

      {/* Our Journey */}
      <section
        className={`history-section py-16 md:py-24 bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-1000 transform ${animateClass(
          "history",
        )}`}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-700 text-blue-100 rounded-full text-sm font-semibold mb-4">
              OUR STORY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Journey</h2>
            <p className="text-lg text-blue-100">
              From a small startup to India's leading real estate platform
            </p>
          </div>
          <div className="relative">
            {/* Timeline */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-400"></div>

            {/* Timeline Items */}
            <div className="space-y-16">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="bg-blue-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-blue-300 mb-3">
                      2015
                    </h3>
                    <p className="text-blue-100 text-lg">
                      HomeYatra was founded in Mumbai with a vision to transform
                      real estate experiences in India
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-6 h-6 animate-pulse bg-blue-400 rounded-full absolute left-1/2 transform -translate-x-1/2 border-4 border-blue-800"></div>
                <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0"></div>
              </div>

              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right"></div>
                <div className="hidden md:block w-6 h-6 animate-pulse bg-blue-400 rounded-full absolute left-1/2 transform -translate-x-1/2 border-4 border-blue-800"></div>
                <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0">
                  <div className="bg-blue-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-blue-300 mb-3">
                      2018
                    </h3>
                    <p className="text-blue-100 text-lg">
                      Expanded to 10 major cities across India and launched our
                      innovative property matching technology
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="bg-blue-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-blue-300 mb-3">
                      2020
                    </h3>
                    <p className="text-blue-100 text-lg">
                      Pioneered virtual property tours during the pandemic,
                      helping families find homes safely
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-6 h-6 animate-pulse bg-blue-400 rounded-full absolute left-1/2 transform -translate-x-1/2 border-4 border-blue-800"></div>
                <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0"></div>
              </div>

              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right"></div>
                <div className="hidden md:block w-6 h-6 animate-pulse bg-blue-400 rounded-full absolute left-1/2 transform -translate-x-1/2 border-4 border-blue-800"></div>
                <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0">
                  <div className="bg-blue-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-blue-300 mb-3">
                      Today
                    </h3>
                    <p className="text-blue-100 text-lg">
                      Serving 25+ cities with an ecosystem of services that make
                      finding your dream home simpler than ever
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className={`testimonials-section py-16 md:py-24 bg-gray-50 transition-all duration-1000 transform ${animateClass(
          "testimonials",
        )}`}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              CLIENT STORIES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600">
              Hear from families who found their dream homes with HomeYatra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="HomeYatra made our home buying journey stress-free. Their team understood exactly what we were looking for and found us the perfect apartment within our budget."
              author="Ananya & Rohan"
              position="Mumbai"
              image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=388&q=80"
            />
            <TestimonialCard
              quote="As a first-time homebuyer, I was nervous about the process. The HomeYatra team guided me through every step and helped me find a beautiful home in Bangalore."
              author="Vikram Desai"
              position="Bangalore"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
            />
            <TestimonialCard
              quote="We were relocating from the US to Delhi and needed to find a home quickly. HomeYatra's virtual tours and personalized recommendations made it possible to find our dream home before we even landed!"
              author="The Sharma Family"
              position="Delhi"
              image="https://images.unsplash.com/photo-1581781870027-02f926342c6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
            />
          </div>
        </div>
      </section>

      {/* Property Showcase */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              PREMIUM LISTINGS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600">
              Discover some of our most exclusive properties available right now
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Property Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="relative h-64">
                <img
                  src="/api/placeholder/600/400"
                  alt="Luxury Villa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md font-medium">
                  Premium
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Luxury Villa in Bandra
                </h3>
                <p className="text-gray-600 mb-4">
                  A stunning 4BHK villa with ocean views and modern amenities
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">₹4.5 Cr</span>
                  <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Property Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="relative h-64">
                <img
                  src="/api/placeholder/600/400"
                  alt="Modern Apartment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-md font-medium">
                  New
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Modern Apartment in Powai
                </h3>
                <p className="text-gray-600 mb-4">
                  A spacious 3BHK apartment with panoramic city views
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">₹2.8 Cr</span>
                  <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Property Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="relative h-64">
                <img
                  src="/api/placeholder/600/400"
                  alt="Penthouse"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-md font-medium">
                  Featured
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Luxurious Penthouse in Juhu
                </h3>
                <p className="text-gray-600 mb-4">
                  A 5BHK penthouse with private terrace and swimming pool
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">₹7.2 Cr</span>
                  <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className={`contact-section py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-500 text-white transition-all duration-1000 transform ${animateClass(
          "contact",
        )}`}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-700 text-blue-100 rounded-full text-sm font-semibold mb-4">
              GET IN TOUCH
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-lg text-blue-100">
              Our team of experts is ready to help you begin your home journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 text-center hover:bg-opacity-15 transition-all duration-300 flex flex-col items-center">
              <div className="bg-blue-700 p-4 rounded-full mb-6">
                <Phone size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Call Us</h3>
              <p className="mb-4">
                Our team is available Monday-Saturday, 9am-6pm
              </p>
              <a
                href="tel:+918000123456"
                className="text-xl font-semibold hover:text-blue-200 transition-colors"
              >
                +91 8000 123 456
              </a>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 text-center hover:bg-opacity-15 transition-all duration-300 flex flex-col items-center">
              <div className="bg-blue-700 p-4 rounded-full mb-6">
                <Mail size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Email Us</h3>
              <p className="mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <a
                href="mailto:support@homeyatra.com"
                className="text-xl font-semibold hover:text-blue-200 transition-colors"
              >
                support@homeyatra.com
              </a>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 text-center hover:bg-opacity-15 transition-all duration-300 flex flex-col items-center">
              <div className="bg-blue-700 p-4 rounded-full mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Visit Us</h3>
              <p className="mb-4">Find us at our corporate office</p>
              <address className="text-xl font-semibold not-italic">
                HomeYatra Tower, Bandra Kurla Complex, Mumbai
              </address>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-md font-semibold flex items-center mx-auto group transition-all duration-300 transform hover:scale-105">
              <Home className="mr-2" />
              Schedule a Consultation
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Start Your Home Journey Today
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Join thousands of satisfied homeowners who found their perfect space
            with HomeYatra
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 w-full md:w-auto">
              Search Properties
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 w-full md:w-auto">
              Contact an Agent
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
