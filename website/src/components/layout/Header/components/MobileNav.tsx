/**
 * Mobile Navigation Component
 *
 * Polished mobile menu with icons, smooth animations, and optimized UX
 */

import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Download,
  Github,
  Home,
  Zap,
  Images,
  HelpCircle,
  CheckCircle,
  PlayCircle,
  BookOpen,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Search,
  FileText
} from 'lucide-react';
import type { NavLink } from '../types';
import { GITHUB_URL } from '../constants';
import { useGlobalSearch } from '@/components/common';

interface MobileNavProps {
  isOpen: boolean;
  activeSection: string;
  isActive: (link: NavLink, activeSection: string) => boolean;
  handleNavClick: (link: NavLink, e: React.MouseEvent, onClose?: () => void) => void;
  onDownloadClick: () => void;
  onClose: () => void;
}

// Icon mapping for navigation items
const navIcons: Record<string, React.ElementType> = {
  'Home': Home,
  'Features': Zap,
  'Gallery': Images,
  'FAQ': HelpCircle,
  'Compatibility': CheckCircle,
  'How It Works': PlayCircle,
  'Installation': BookOpen,
  'Documentation': FileText,
  'Diagrams': GitBranch,
};

// Section links (scroll to section on home page)
const SECTION_LINKS: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: 'features', isSection: true },
  { name: 'Gallery', href: 'gallery', isSection: true },
  { name: 'FAQ', href: 'faq', isSection: true },
  { name: 'Compatibility', href: 'compatibility', isSection: true },
  { name: 'How It Works', href: 'usage', isSection: true },
];

// Page links (navigate to different pages)
const PAGE_LINKS: NavLink[] = [
  { name: 'Installation', href: '/installation' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'Diagrams', href: '/diagrams' },
];

export function MobileNav({
  isOpen,
  activeSection,
  isActive,
  handleNavClick,
  onDownloadClick,
  onClose,
}: MobileNavProps) {
  const location = useLocation();
  const { open: openSearch } = useGlobalSearch();

  const getAnimationStyle = (index: number) => ({
    transform: isOpen ? 'translateX(0)' : 'translateX(-16px)',
    opacity: isOpen ? 1 : 0,
    transition: `all 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${index * 30}ms`,
  });

  const isCurrentPage = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 top-16 bg-black/70 backdrop-blur-md z-40 transition-all duration-400 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-16 left-0 right-0 z-50 transition-all duration-400 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="mx-3 sm:mx-4 mt-2 rounded-2xl bg-linear-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 max-h-[calc(100vh-5.5rem)] overflow-y-auto overflow-x-hidden scrollbar-thin">
          {/* Header Badge */}
          <div className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-linear-to-b from-slate-900/98 to-transparent">
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-linear-to-r from-primary/15 to-cyan-500/10 border border-primary/20"
              style={getAnimationStyle(0)}
            >
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primary">Free & Open Source</span>
                <span className="text-[10px] text-primary/60">No ads, no tracking</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-2">
            {/* Sections */}
            <div>
              <div
                className="flex items-center gap-2 px-2 py-2 text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold"
                style={getAnimationStyle(1)}
              >
                <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
                <span>Navigate</span>
                <div className="h-px flex-1 bg-linear-to-l from-white/10 to-transparent" />
              </div>

              <div className="space-y-0.5">
                {SECTION_LINKS.map((link, index) => {
                  const Icon = navIcons[link.name] || Home;
                  const active = link.name === 'Home' ? isCurrentPage('/') && !activeSection : isActive(link, activeSection);

                  return link.isSection ? (
                    <button
                      key={link.name}
                      onClick={(e) => handleNavClick(link, e, onClose)}
                      className={`w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-left cursor-pointer flex items-center gap-3 group ${
                        active
                          ? 'text-primary bg-primary/10 shadow-sm shadow-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-white/10'
                      }`}
                      style={getAnimationStyle(index + 2)}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      </div>
                      <span className="flex-1">{link.name}</span>
                      <ChevronRight className={`w-4 h-4 transition-all ${active ? 'text-primary opacity-100' : 'opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0'}`} />
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group ${
                        active
                          ? 'text-primary bg-primary/10 shadow-sm shadow-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-white/10'
                      }`}
                      style={getAnimationStyle(index + 2)}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      </div>
                      <span className="flex-1">{link.name}</span>
                      <ChevronRight className={`w-4 h-4 transition-all ${active ? 'text-primary opacity-100' : 'opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pages */}
            <div>
              <div
                className="flex items-center gap-2 px-2 py-2 text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold"
                style={getAnimationStyle(SECTION_LINKS.length + 2)}
              >
                <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
                <span>Pages</span>
                <div className="h-px flex-1 bg-linear-to-l from-white/10 to-transparent" />
              </div>

              <div className="space-y-0.5">
                {PAGE_LINKS.map((link, index) => {
                  const Icon = navIcons[link.name] || Folder;
                  const active = isCurrentPage(link.href);

                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group ${
                        active
                          ? 'text-primary bg-primary/10 shadow-sm shadow-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-white/10'
                      }`}
                      style={getAnimationStyle(SECTION_LINKS.length + index + 3)}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      </div>
                      <span className="flex-1">{link.name}</span>
                      <ChevronRight className={`w-4 h-4 transition-all ${active ? 'text-primary opacity-100' : 'opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="pt-3 mt-2 border-t border-white/5 space-y-2"
              style={getAnimationStyle(SECTION_LINKS.length + PAGE_LINKS.length + 3)}
            >
              {/* Search Button */}
              <button
                onClick={() => {
                  onClose();
                  setTimeout(openSearch, 100);
                }}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
                <kbd className="ml-auto px-2 py-0.5 rounded bg-white/10 text-xs font-mono">Ctrl+K</kbd>
              </button>

              {/* Download Button - Primary CTA */}
              <button
                onClick={onDownloadClick}
                className="w-full px-4 py-3.5 text-sm font-semibold rounded-xl bg-linear-to-r from-primary to-cyan-500 text-white flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Download</span>
              </button>

              {/* GitHub Button */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-sm font-medium rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
              >
                <Github className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 ml-auto" />
              </a>
            </div>

            {/* Footer */}
            <div
              className="pt-3 text-center"
              style={getAnimationStyle(SECTION_LINKS.length + PAGE_LINKS.length + 5)}
            >
              <p className="text-[10px] text-muted-foreground/40">
                Made with ♥ by TrexoLab
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
