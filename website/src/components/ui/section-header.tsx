import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  badge,
  title,
  subtitle,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-medium mb-6">
        <Icon className="w-4 h-4" />
        <span>{badge}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
        <span className="gradient-text">{title}</span>
      </h2>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}
