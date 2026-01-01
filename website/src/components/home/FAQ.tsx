import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Wrench,
  Scale,
  Puzzle,
  Monitor,
  Shield,
  Search,
  X,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { faqs, categoryColors } from '@/data/faqs';
import { ISSUES_URL, ANIMATION } from '@/utils/constants';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import type { FAQ, FAQCategory } from '@/data/types';

// Category configuration with icons and colors
const categoryConfig: Record<
  FAQCategory,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  general: {
    label: 'General',
    icon: Sparkles,
    color: 'bg-blue-500/20 text-blue-400',
    bgColor: 'bg-blue-500',
  },
  technical: {
    label: 'Technical',
    icon: Wrench,
    color: 'bg-violet-500/20 text-violet-400',
    bgColor: 'bg-violet-500',
  },
  legal: {
    label: 'Legal',
    icon: Scale,
    color: 'bg-emerald-500/20 text-emerald-400',
    bgColor: 'bg-emerald-500',
  },
  features: {
    label: 'Features',
    icon: Puzzle,
    color: 'bg-amber-500/20 text-amber-400',
    bgColor: 'bg-amber-500',
  },
  compatibility: {
    label: 'Compatibility',
    icon: Monitor,
    color: 'bg-cyan-500/20 text-cyan-400',
    bgColor: 'bg-cyan-500',
  },
  privacy: {
    label: 'Privacy',
    icon: Shield,
    color: 'bg-rose-500/20 text-rose-400',
    bgColor: 'bg-rose-500',
  },
};

// Get unique categories from FAQs
const categories = Object.keys(categoryConfig) as FAQCategory[];

// FAQ Item Component
function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
  isVisible,
}: {
  faq: FAQ;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isVisible: boolean;
}) {
  const colors = categoryColors[faq.category] || categoryColors.general;

  return (
    <div
      className={`group relative transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * ANIMATION.staggerDelay}ms` }}
    >
      {/* Subtle glow on open */}
      {isOpen && (
        <div className="absolute -inset-1 bg-linear-to-r from-primary/10 via-cyan-500/5 to-primary/10 rounded-2xl blur-xl opacity-60 pointer-events-none" />
      )}

      <div
        className={`
          relative overflow-hidden rounded-2xl backdrop-blur-xl
          transition-all duration-500 ease-out
          ${isOpen
            ? 'bg-slate-900/80 border border-slate-700/80 shadow-lg shadow-primary/5'
            : 'bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/80'
          }
        `}
      >
        <button
          onClick={onToggle}
          className="w-full px-6 py-5 flex items-start justify-between text-left"
        >
          <div className="flex items-start gap-4 pr-4">
            {/* Question icon */}
            <div
              className={`
                mt-0.5 w-8 h-8 rounded-lg ${colors.bg}
                flex items-center justify-center shrink-0
                ring-1 ring-white/5
                transition-all duration-500 ease-out
                ${isOpen ? 'scale-105' : 'group-hover:scale-105'}
              `}
            >
              <MessageCircle className={`w-4 h-4 ${colors.text}`} />
            </div>

            <div>
              <span
                className={`
                  font-medium transition-colors duration-500
                  ${isOpen ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'}
                `}
              >
                {faq.question}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <div
            className={`
              mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
              transition-all duration-500 ease-out
              ${isOpen
                ? 'bg-primary/10 rotate-180'
                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
              }
            `}
          >
            <ChevronDown
              className={`
                w-4 h-4 transition-colors duration-500
                ${isOpen ? 'text-primary' : 'text-slate-500'}
              `}
            />
          </div>
        </button>

        {/* Answer - animated expand */}
        <div
          className={`grid transition-all duration-500 ease-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-6 pb-5">
              <div className="pl-12 border-l border-primary/20 ml-4">
                <p className="text-slate-400 text-sm leading-relaxed pl-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState<Record<string, number | null>>({
    all: 0,
    general: 0,
    technical: 0,
    legal: 0,
    features: 0,
    compatibility: 0,
    privacy: 0,
  });

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation({ threshold: 0.05 });
  const { ref: helpRef, isVisible: helpVisible } = useScrollAnimation();

  // Group FAQs by category
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQ[]> = { all: faqs };
    categories.forEach((cat) => {
      grouped[cat] = faqs.filter((faq) => faq.category === cat);
    });
    return grouped;
  }, []);

  // Filter FAQs by search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqsByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, FAQ[]> = {};

    Object.entries(faqsByCategory).forEach(([cat, items]) => {
      filtered[cat] = items.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [faqsByCategory, searchQuery]);

  // Get count for each category (based on filtered results)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredFaqs.all?.length || 0 };
    categories.forEach((cat) => {
      counts[cat] = filteredFaqs[cat]?.length || 0;
    });
    return counts;
  }, [filteredFaqs]);

  const toggleFAQ = (category: string, index: number) => {
    setOpenIndices((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  const currentFaqs = filteredFaqs[activeCategory] || [];
  const currentOpenIndex = openIndices[activeCategory] ?? null;

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 particle-grid opacity-20" />

      {/* Floating orbs */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-10 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <p className="text-lg text-slate-400 mb-6">
            Everything you need to know about eMark. Browse by category or search
            all questions.
          </p>

          {/* Search Input */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <p className="text-sm text-slate-500 mt-3">
              Found {categoryCounts.all} result{categoryCounts.all !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Category Tabs */}
        <div
          className={`mb-8 transition-all duration-700 delay-100 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Tabs
            defaultValue="all"
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <div className="flex justify-center">
              <TabsList className="flex-wrap gap-1 max-w-full">
                {/* All Tab */}
                <TabsTrigger
                  value="all"
                  badge={categoryCounts.all}
                  icon={<Sparkles className="w-4 h-4" />}
                  color={activeCategory === 'all' ? 'bg-primary/20 text-primary' : ''}
                >
                  All
                </TabsTrigger>

                {/* Category Tabs */}
                {categories.map((cat) => {
                  const config = categoryConfig[cat];
                  const Icon = config.icon;
                  return (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      badge={categoryCounts[cat]}
                      icon={<Icon className="w-4 h-4" />}
                      color={activeCategory === cat ? config.color : ''}
                    >
                      {config.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* All FAQs Tab Content */}
            <TabsContent value="all">
              <div ref={faqRef} className="space-y-4">
                {currentFaqs.map((faq, index) => (
                  <FAQItem
                    key={`all-${index}`}
                    faq={faq}
                    index={index}
                    isOpen={currentOpenIndex === index}
                    onToggle={() => toggleFAQ('all', index)}
                    isVisible={faqVisible}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Category Tab Contents */}
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="space-y-4">
                  {faqsByCategory[cat]?.map((faq, index) => (
                    <FAQItem
                      key={`${cat}-${index}`}
                      faq={faq}
                      index={index}
                      isOpen={openIndices[cat] === index}
                      onToggle={() => toggleFAQ(cat, index)}
                      isVisible={faqVisible}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* More Help Section */}
        <div
          ref={helpRef}
          className={`mt-12 transition-all duration-700 ${
            helpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

            <div className="relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-primary/20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto">
                Check out our comprehensive documentation or open an issue on
                GitHub. We're here to help!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/documentation"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 ring-1 ring-slate-700/50 text-sm text-slate-300 hover:text-primary hover:ring-primary/30 transition-all duration-300 group"
                >
                  <span>Documentation</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/30 text-sm text-primary hover:bg-primary/20 transition-all duration-300 group"
                >
                  <span>Report an Issue</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
