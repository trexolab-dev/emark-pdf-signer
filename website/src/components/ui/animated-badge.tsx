import type { LucideIcon } from 'lucide-react';

type BadgeVariant = 'default' | 'success' | 'primary';

interface AnimatedBadgeProps {
  icon: LucideIcon;
  text: string;
  delay?: number;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-800/50 ring-1 ring-slate-700/40 text-slate-300',
  success: 'bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400',
  primary: 'bg-primary/10 ring-1 ring-primary/20 text-primary',
};

export function AnimatedBadge({
  icon: Icon,
  text,
  delay = 0,
  variant = 'default',
}: AnimatedBadgeProps) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-500 ${variantClasses[variant]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}
