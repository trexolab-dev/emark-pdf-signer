/**
 * More Dropdown Component
 */

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavLink, NavGroup } from '../types';

interface MoreDropdownProps {
  moreLinks: NavGroup;
  isAnyActive: boolean;
  isActive: (link: NavLink) => boolean;
  onItemClick: (link: NavLink, e: React.MouseEvent) => void;
}

export function MoreDropdown({ moreLinks, isAnyActive, isActive, onItemClick }: MoreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer-custom overflow-hidden group flex items-center gap-1 ${
          isAnyActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative">{moreLinks.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute top-full left-0 mt-2 py-2 min-w-[160px] rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {moreLinks.items.map((link) => (
          <button
            key={link.name}
            onClick={(e) => {
              onItemClick(link, e);
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-sm text-left transition-all duration-200 ${
              isActive(link)
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {link.name}
          </button>
        ))}
      </div>
    </div>
  );
}
