/**
 * Scroll Progress Bar Component
 */

interface ScrollProgressBarProps {
  progress: number;
}

export function ScrollProgressBar({ progress }: ScrollProgressBarProps) {
  return (
    <div
      className="absolute top-0 left-0 h-0.5 bg-linear-to-r from-primary via-cyan-500 to-primary transition-all duration-150"
      style={{ width: `${progress}%` }}
    />
  );
}
