import * as React from 'react';
import { cn } from '@/utils/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

  const value = controlledValue ?? uncontrolledValue;
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setUncontrolledValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center justify-center gap-1 p-1 rounded-xl',
        'bg-slate-900/50 backdrop-blur-xl border border-slate-800/50',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  badge?: number;
  color?: string;
}

export function TabsTrigger({
  value,
  children,
  className,
  icon,
  badge,
  color,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
        'text-sm font-medium whitespace-nowrap',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isSelected
          ? cn(
              'text-white shadow-lg',
              color || 'bg-primary/20 text-primary'
            )
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
        className
      )}
    >
      {/* Active indicator glow */}
      {isSelected && (
        <div
          className={cn(
            'absolute inset-0 rounded-lg opacity-20 blur-sm',
            color || 'bg-primary'
          )}
        />
      )}

      <span className="relative flex items-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{children}</span>
        {badge !== undefined && badge > 0 && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-xs font-medium',
              isSelected
                ? 'bg-white/20 text-white'
                : 'bg-slate-700/50 text-slate-400'
            )}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'mt-4 focus-visible:outline-none',
        'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}
