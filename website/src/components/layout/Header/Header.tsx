/**
 * Header Component
 *
 * Main header component composed of modular subcomponents.
 * This is the refactored version for better maintainability.
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useScrollProgress, useActiveSection, useNavigation } from './hooks';
import {
  ScrollProgressBar,
  HeaderBranding,
  DesktopNav,
  MobileMenuButton,
  MobileNav,
} from './components';
import { DownloadChoiceDialog } from '@/components/common/DownloadChoiceDialog';
import { useGlobalSearch } from '@/components/common';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const { isScrolled, scrollProgress } = useScrollProgress();
  const activeSection = useActiveSection();
  const { handleNavClick, isActive } = useNavigation();
  const { open: openSearch } = useGlobalSearch();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Scroll progress bar */}
      <ScrollProgressBar progress={scrollProgress} />

      {/* Header background */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-out ${
          isScrolled
            ? 'bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <HeaderBranding />

          {/* Desktop Navigation */}
          <DesktopNav
            activeSection={activeSection}
            isActive={isActive}
            handleNavClick={handleNavClick}
            onDownloadClick={() => setDownloadDialogOpen(true)}
          />

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            {/* Mobile Search Button */}
            <button
              onClick={openSearch}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer-custom"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Mobile Menu Button */}
            <MobileMenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMenuOpen}
        activeSection={activeSection}
        isActive={isActive}
        handleNavClick={handleNavClick}
        onDownloadClick={() => { setDownloadDialogOpen(true); setIsMenuOpen(false); }}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Download Choice Dialog */}
      <DownloadChoiceDialog
        isOpen={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
      />
    </header>
  );
}
