import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to the very top on route changes
    // Using both approaches for maximum compatibility
    window.scrollTo(0, 0);
    
    // Force scroll for document element and body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // For Safari
    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop; 