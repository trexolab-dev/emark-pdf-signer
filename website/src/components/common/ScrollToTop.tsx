/**
 * ScrollToTop Component
 *
 * Scrolls to the top of the page when the route changes.
 * This ensures users always start at the top of a new page.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Use 'instant' for immediate scroll on navigation
    });
  }, [pathname]);

  return null;
}
