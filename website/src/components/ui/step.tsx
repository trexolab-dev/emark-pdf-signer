interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4 min-w-0 group">
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary to-cyan-500 flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
          {number}
        </div>
        {/* Connector line */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-1rem)] bg-linear-to-b from-primary/30 to-transparent hidden group-last:hidden sm:block" />
      </div>
      <div className="flex-1 pt-1.5 min-w-0 overflow-hidden pb-2">
        <h3 className="font-semibold mb-2 text-lg">{title}</h3>
        {children}
      </div>
    </div>
  );
}
