import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 *
 * Combined functionality:
 * 1. Automatically scrolls to top when route changes (with immediate behavior)
 * 2. Shows a floating button when scrolled down that allows manual scrolling to top
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  // Show button when user scrolls down 300px
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly for button click
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Effect for scroll button visibility
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Effect for automatic scroll to top on route change
  // Using immediate scroll (not smooth) to ensure it happens instantly
  useEffect(() => {
    // Use setTimeout to ensure this happens after route change is complete
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [pathname]);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
