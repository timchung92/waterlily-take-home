import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Assuming you're using react-router for routing

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector("body")?.scrollTo(0,0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component does not render anything
};

export default ScrollToTop;
