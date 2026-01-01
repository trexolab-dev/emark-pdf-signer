/**
 * Hook for navigation handling
 */

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NavLink } from '../types';
import { NAV_LINKS, MORE_LINKS } from '../constants';

export function useNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = useCallback((sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.pathname, navigate]);

  const handleNavClick = useCallback((link: NavLink, e: React.MouseEvent, onClose?: () => void) => {
    if (link.isSection) {
      e.preventDefault();
      scrollToSection(link.href);
      onClose?.();
    } else {
      onClose?.();
    }
  }, [scrollToSection]);

  const isActive = useCallback((link: NavLink, activeSection: string) => {
    if (link.isSection) {
      return location.pathname === '/' && activeSection === link.href;
    }
    if (link.href === '/') {
      const allSections = [...NAV_LINKS, ...MORE_LINKS.items]
        .filter(l => l.isSection)
        .map(l => l.href);
      return location.pathname === '/' && (!activeSection || !allSections.includes(activeSection));
    }
    return location.pathname === link.href;
  }, [location.pathname]);

  return { scrollToSection, handleNavClick, isActive };
}
