/**
 * Mobile Menu Toggle Button
 * Clean, minimal design
 */

import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer-custom"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="relative w-4 h-4">
        <Menu
          className={`w-4 h-4 absolute inset-0 transition-all duration-200 ${
            isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <X
          className={`w-4 h-4 absolute inset-0 transition-all duration-200 ${
            isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
