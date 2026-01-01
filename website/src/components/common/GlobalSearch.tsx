import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, FileText, HelpCircle, BookOpen, Download, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { faqs } from '@/data/faqs';

// Create context for global search state
interface GlobalSearchContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null);

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon: React.ElementType;
  type: 'page' | 'section' | 'faq';
  keywords?: string[];
}

// Static searchable content with keywords for better matching
const SEARCHABLE_CONTENT: SearchResult[] = [
  // Pages
  { id: 'home', title: 'Home', description: 'eMark PDF signing software overview', category: 'Pages', url: '/', icon: FileText, type: 'page', keywords: ['main', 'start', 'landing'] },
  { id: 'installation', title: 'Installation Guide', description: 'How to install eMark on Windows, Linux, macOS', category: 'Pages', url: '/installation', icon: Download, type: 'page', keywords: ['setup', 'install', 'download', 'get started'] },
  { id: 'documentation', title: 'Documentation', description: 'Complete guide to eMark features and configuration', category: 'Pages', url: '/documentation', icon: BookOpen, type: 'page', keywords: ['docs', 'guide', 'manual', 'help'] },
  { id: 'diagrams', title: 'Architecture Diagrams', description: 'Visual diagrams of eMark architecture', category: 'Pages', url: '/diagrams', icon: FileText, type: 'page', keywords: ['charts', 'flow', 'visual'] },

  // Home Sections
  { id: 'features', title: 'Features', description: 'Key features of eMark PDF signing', category: 'Sections', url: '/#features', icon: FileText, type: 'section', keywords: ['capabilities', 'functions'] },
  { id: 'gallery', title: 'Screenshot Gallery', description: 'See eMark in action', category: 'Sections', url: '/#gallery', icon: FileText, type: 'section', keywords: ['images', 'screenshots', 'preview'] },
  { id: 'faq-section', title: 'FAQ', description: 'Frequently asked questions', category: 'Sections', url: '/#faq', icon: HelpCircle, type: 'section', keywords: ['questions', 'answers', 'help'] },
  { id: 'compatibility', title: 'Compatibility', description: 'Adobe Reader and PDF compatibility', category: 'Sections', url: '/#compatibility', icon: FileText, type: 'section', keywords: ['adobe', 'support', 'readers'] },
  { id: 'download', title: 'Download', description: 'Download eMark for your platform', category: 'Sections', url: '/#download', icon: Download, type: 'section', keywords: ['get', 'install'] },

  // Documentation Sections
  { id: 'doc-certificates', title: 'Certificate Types', description: 'PKCS#12, PKCS#11, Windows Certificate Store', category: 'Documentation', url: '/documentation#certificates', icon: Settings, type: 'section', keywords: ['pfx', 'p12', 'cert', 'key'] },
  { id: 'doc-signing', title: 'Digital Signing', description: 'Signature appearance and certification levels', category: 'Documentation', url: '/documentation#signing', icon: FileText, type: 'section', keywords: ['sign', 'signature', 'certify'] },
  { id: 'doc-security', title: 'Security Standards', description: 'ISO 32000, PAdES, RFC 3161 compliance', category: 'Documentation', url: '/documentation#security', icon: Settings, type: 'section', keywords: ['pades', 'iso', 'compliance', 'standards'] },
  { id: 'doc-timestamping', title: 'Timestamping', description: 'RFC 3161 timestamp authority configuration', category: 'Documentation', url: '/documentation#timestamping', icon: Settings, type: 'section', keywords: ['tsa', 'timestamp', 'time', 'rfc3161'] },
  { id: 'doc-privacy', title: 'Privacy', description: '100% offline operation and data protection', category: 'Documentation', url: '/documentation#privacy', icon: Settings, type: 'section', keywords: ['offline', 'local', 'data', 'secure'] },
  { id: 'doc-usb-tokens', title: 'USB Tokens', description: 'Supported hardware tokens and HSMs', category: 'Documentation', url: '/documentation#usb-tokens', icon: Settings, type: 'section', keywords: ['hardware', 'token', 'hsm', 'pkcs11', 'smartcard'] },
  { id: 'doc-configuration', title: 'Configuration', description: 'Config file location and memory profiles', category: 'Documentation', url: '/documentation#configuration', icon: Settings, type: 'section', keywords: ['config', 'settings', 'memory', 'options'] },

  // Installation Sections
  { id: 'install-windows', title: 'Windows Installation', description: 'Install eMark on Windows with bundled Java', category: 'Installation', url: '/installation#windows', icon: Download, type: 'section', keywords: ['windows', 'win', 'exe', 'installer'] },
  { id: 'install-linux', title: 'Linux Installation', description: 'Install eMark on Ubuntu, Debian, Fedora, Arch', category: 'Installation', url: '/installation#linux', icon: Download, type: 'section', keywords: ['linux', 'ubuntu', 'debian', 'fedora', 'arch', 'deb', 'rpm'] },
  { id: 'install-macos', title: 'macOS Installation', description: 'Install eMark on macOS with DMG installer', category: 'Installation', url: '/installation#macos', icon: Download, type: 'section', keywords: ['mac', 'macos', 'dmg', 'apple'] },
  { id: 'install-java', title: 'Java 8 Setup', description: 'Java 8 requirements and configuration', category: 'Installation', url: '/installation#java-setup', icon: Settings, type: 'section', keywords: ['java', 'jdk', 'jre', 'runtime'] },
  { id: 'install-certificate', title: 'Certificate Setup', description: 'Configure signing certificates', category: 'Installation', url: '/installation#certificate-setup', icon: Settings, type: 'section', keywords: ['cert', 'certificate', 'setup', 'configure'] },
  { id: 'install-troubleshooting', title: 'Troubleshooting', description: 'Common issues and solutions', category: 'Installation', url: '/installation#troubleshooting', icon: HelpCircle, type: 'section', keywords: ['problem', 'issue', 'error', 'fix', 'help'] },
];

// Generate FAQ search results from data (faqs is an array)
const FAQ_RESULTS: SearchResult[] = faqs.map((faq, index) => ({
  id: `faq-${faq.category}-${index}`,
  title: faq.question,
  description: faq.answer.substring(0, 100) + '...',
  category: 'FAQ',
  url: '/#faq',
  icon: HelpCircle,
  type: 'faq' as const,
  keywords: faq.question.toLowerCase().split(' ').filter(w => w.length > 3),
}));

const ALL_RESULTS = [...SEARCHABLE_CONTENT, ...FAQ_RESULTS];

// Improved search with relevance scoring
function searchWithRelevance(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);

  const scored = ALL_RESULTS.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const keywords = item.keywords || [];

    for (const term of searchTerms) {
      // Exact title match - highest priority
      if (titleLower === term) score += 100;
      // Title starts with term
      else if (titleLower.startsWith(term)) score += 50;
      // Title contains term
      else if (titleLower.includes(term)) score += 30;
      // Keywords match
      if (keywords.some(k => k.includes(term) || term.includes(k))) score += 25;
      // Description contains term
      if (descLower.includes(term)) score += 10;
      // Category match
      if (item.category.toLowerCase().includes(term)) score += 5;
    }

    // Boost pages over sections
    if (item.type === 'page') score += 5;

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const results = useMemo(() => searchWithRelevance(query), [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    onClose();
    setQuery('');

    // Handle hash navigation
    if (result.url.includes('#')) {
      const [path, hash] = result.url.split('#');
      if (location.pathname === path || (path === '/' && location.pathname === '/')) {
        // Same page, scroll to section
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Different page, navigate
        navigate(result.url);
      }
    } else {
      navigate(result.url);
    }
  }, [navigate, onClose, location.pathname]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, results.length]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-[12%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 animate-slide-up-fade">
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-slate-900/95 backdrop-blur-2xl border border-white/10">
          {/* Search Input - Premium Design */}
          <div className="relative">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="flex items-center gap-4 px-6 py-5">
              {/* Search Icon with glow effect */}
              <div className="relative">
                <Search className="w-5 h-5 text-primary" />
                <div className="absolute inset-0 w-5 h-5 bg-primary/30 blur-md" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs, pages, FAQs..."
                className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/50 caret-primary selection:bg-primary/30 [&:focus]:outline-none [&:focus-visible]:outline-none"
                autoComplete="off"
                spellCheck={false}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />

              <div className="flex items-center gap-3">
                <kbd className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground font-mono">
                  ESC
                </kbd>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer-custom group"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>
            </div>

            {/* Subtle bottom border */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {query && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No results found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all rounded-xl cursor-pointer-custom ${
                      index === selectedIndex
                        ? 'bg-primary/15 text-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      index === selectedIndex ? 'bg-primary/20' : 'bg-white/5'
                    }`}>
                      <result.icon className={`w-5 h-5 ${index === selectedIndex ? 'text-primary' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{result.description}</p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                      index === selectedIndex ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                    }`}>
                      {result.category}
                    </span>
                    {index === selectedIndex && (
                      <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="p-6">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-4">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {SEARCHABLE_CONTENT.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all text-sm text-muted-foreground hover:text-foreground cursor-pointer-custom group"
                    >
                      <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground/60">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
            </div>
            <span className="font-medium">
              {results.length > 0 ? `${results.length} results` : 'Start typing...'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// Provider component for global search
export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <GlobalSearchContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </GlobalSearchContext.Provider>
  );
}

// Hook to use global search
export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);

  // Fallback for when used outside provider (backwards compatibility)
  const [fallbackIsOpen, setFallbackIsOpen] = useState(false);

  useEffect(() => {
    if (context) return; // Skip if using context

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setFallbackIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [context]);

  if (context) {
    return context;
  }

  // Fallback return (should not be used when provider is properly set up)
  return {
    isOpen: fallbackIsOpen,
    open: () => setFallbackIsOpen(true),
    close: () => setFallbackIsOpen(false),
    toggle: () => setFallbackIsOpen((prev) => !prev),
  };
}
