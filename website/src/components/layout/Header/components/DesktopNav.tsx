/**
 * Desktop Navigation Component
 * Clean, minimal design matching site theme
 */

import { Link } from 'react-router-dom';
import { Download, Github, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { NavLink } from '../types';
import { GITHUB_URL } from '../constants';
import { useGlobalSearch } from '@/components/common';

// Combined nav structure - cleaner organization
const PRIMARY_NAV: NavLink[] = [
  { name: 'Features', href: 'features', isSection: true },
  { name: 'Gallery', href: 'gallery', isSection: true },
  { name: 'FAQ', href: 'faq', isSection: true },
];

const SECONDARY_NAV = {
  name: 'More',
  items: [
    { name: 'Compatibility', href: 'compatibility', isSection: true },
    { name: 'How It Works', href: 'usage', isSection: true },
  ] as NavLink[],
};

const PAGES_NAV: NavLink[] = [
  { name: 'Docs', href: '/documentation' },
  { name: 'Install', href: '/installation' },
  { name: 'Diagrams', href: '/diagrams' },
];

interface DesktopNavProps {
  activeSection: string;
  isActive: (link: NavLink, activeSection: string) => boolean;
  handleNavClick: (link: NavLink, e: React.MouseEvent) => void;
  onDownloadClick: () => void;
}

export function DesktopNav({ activeSection, isActive, handleNavClick, onDownloadClick }: DesktopNavProps) {
  const { open: openSearch } = useGlobalSearch();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavButton = ({ link, active }: { link: NavLink; active: boolean }) => {
    if (link.isSection) {
      return (
        <button
          onClick={(e) => handleNavClick(link, e)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer-custom ${
            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {link.name}
        </button>
      );
    }
    return (
      <Link
        to={link.href}
        className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer-custom ${
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <div className="hidden lg:flex items-center gap-1">
      {/* Main Navigation - Compact pill container */}
      <nav className="flex items-center bg-white/5 rounded-full px-1 py-1 border border-white/10">
        {PRIMARY_NAV.map((link) => (
          <NavButton key={link.name} link={link} active={isActive(link, activeSection)} />
        ))}

        {/* More Dropdown */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer-custom ${
              SECONDARY_NAV.items.some(item => isActive(item, activeSection))
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            More
            <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
          </button>

          {moreOpen && (
            <div className="absolute top-full right-0 mt-2 py-1.5 min-w-[140px] rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl animate-fade-in">
              {SECONDARY_NAV.items.map((link) => (
                <button
                  key={link.name}
                  onClick={(e) => {
                    handleNavClick(link, e);
                    setMoreOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                    isActive(link, activeSection)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Page Links */}
        {PAGES_NAV.map((link) => (
          <NavButton key={link.name} link={link} active={isActive(link, activeSection)} />
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-3">
        {/* Search */}
        <button
          onClick={openSearch}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all cursor-pointer-custom group"
          aria-label="Search (Ctrl+K)"
          title="Search (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* GitHub */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer-custom group"
          aria-label="View on GitHub"
          title="GitHub"
        >
          <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>

        {/* Download CTA */}
        <button
          onClick={onDownloadClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all cursor-pointer-custom active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
