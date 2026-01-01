import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/utils';

interface IconBoxProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glow';
  className?: string;
  iconClassName?: string;
}

const sizeClasses = {
  sm: { container: 'w-10 h-10 rounded-lg', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6' },
  lg: { container: 'w-14 h-14 rounded-xl', icon: 'w-7 h-7' },
};

const variantClasses = {
  default: 'bg-white/10 ring-1 ring-white/10',
  gradient: 'bg-linear-to-br from-primary/20 to-cyan-500/20',
  glow: 'bg-primary/20 animate-pulse-glow',
};

export function IconBox({
  icon: Icon,
  size = 'md',
  variant = 'default',
  className = '',
  iconClassName = 'text-primary',
}: IconBoxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        sizeClasses[size].container,
        variantClasses[variant],
        className
      )}
    >
      <Icon className={cn(sizeClasses[size].icon, iconClassName)} />
    </div>
  );
}
