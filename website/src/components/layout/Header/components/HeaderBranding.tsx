/**
 * Header Branding Component (Logo + Title)
 * Clean, minimal branding
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';

export function HeaderBranding() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (location.pathname === '/') {
      // Already on home page - scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to home page and scroll to top
      navigate('/');
      // Small delay to allow navigation, then scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      className="flex items-center gap-2.5 group cursor-pointer-custom shrink-0"
    >
      {/* Logo */}
      <div className="relative w-8 h-8 shrink-0">
        <img
          src={`${import.meta.env.BASE_URL}images/logo.png`}
          alt="eMark PDF Signer Logo"
          className="w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105 object-contain"
        />
      </div>
      {/* Brand Name */}
      <span className="text-xl font-bold gradient-text">eMark PDF Signer</span>
    </Link>
  );
}
