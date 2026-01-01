/**
 * Navigation Item Component
 * Reusable component for both section links and page links
 */

import { Link } from 'react-router-dom';
import type { NavLink } from '../types';

interface NavItemProps {
  link: NavLink;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  animationDelay?: number;
}

export function NavItem({ link, isActive, onClick, animationDelay = 0 }: NavItemProps) {
  const baseClassName = `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer-custom overflow-hidden group ${
    isActive
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground'
  }`;

  const content = (
    <>
      {isActive && (
        <span className="absolute inset-0 bg-primary/10 rounded-lg" />
      )}
      <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative">{link.name}</span>
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </>
  );

  if (link.isSection) {
    return (
      <button
        onClick={onClick}
        className={baseClassName}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      className={baseClassName}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {content}
    </Link>
  );
}
