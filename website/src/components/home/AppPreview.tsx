import { Minus, Square, X } from 'lucide-react';

export function AppPreview() {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-[#1a1a1a] border border-slate-700/50 shadow-2xl">
      {/* Window Title Bar - Windows Style */}
      <div className="flex items-center justify-between bg-[#2d2d2d] border-b border-slate-700/50">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {/* App Icon - Use actual logo */}
          <img
            src={`${import.meta.env.BASE_URL}images/logo.png`}
            alt="eMark"
            className="w-4 h-4 rounded-sm"
          />
          <span className="text-xs text-slate-400 font-medium">eMark</span>
        </div>
        {/* Windows Controls - Right aligned, no padding on container */}
        <div className="flex items-center h-full">
          <button className="w-11 h-8 flex items-center justify-center hover:bg-slate-700/50 transition-colors">
            <Minus className="w-3 h-3 text-slate-400" />
          </button>
          <button className="w-11 h-8 flex items-center justify-center hover:bg-slate-700/50 transition-colors">
            <Square className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button className="w-11 h-8 flex items-center justify-center hover:bg-red-500 transition-colors group">
            <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* App Toolbar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#1e1e1e]">
        {/* Open PDF Button - Cyan/Teal like original */}
        <button className="px-4 py-1.5 rounded bg-[#0d9488] hover:bg-[#14b8a6] text-white text-xs font-medium transition-colors">
          Open PDF
        </button>
        {/* Settings Button - Darker teal/gray like original */}
        <button className="px-4 py-1.5 rounded bg-[#0f766e] hover:bg-[#14b8a6] text-white text-xs font-medium transition-colors">
          Settings
        </button>
      </div>

      {/* App Content */}
      <div className="relative aspect-[16/10] flex flex-col bg-[#1a1a1a]">
        {/* Main Content Area - Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
          {/* File Icon - Matching original style */}
          <div className="w-14 h-18 mb-5 relative">
            <svg width="56" height="72" viewBox="0 0 56 72" fill="none" className="drop-shadow-lg">
              {/* Main document body */}
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H36L56 20V68C56 70.2091 54.2091 72 52 72H4C1.79086 72 0 70.2091 0 68V4Z"
                fill="#374151"
                fillOpacity="0.6"
              />
              {/* Folded corner */}
              <path
                d="M36 0L56 20H40C37.7909 20 36 18.2091 36 16V0Z"
                fill="#4B5563"
                fillOpacity="0.8"
              />
            </svg>
          </div>

          {/* Text */}
          <h3 className="text-lg font-medium text-cyan-400/90 mb-2">No PDF Loaded</h3>
          <p className="text-xs text-slate-500 mb-5 text-center max-w-[280px] leading-relaxed">
            Drag and drop a PDF here or click below to open a file
          </p>

          {/* Open PDF Button - Gray/Neutral matching original */}
          <button className="px-5 py-2 rounded bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm font-medium transition-colors border border-slate-600/40">
            Open PDF
          </button>
        </div>
      </div>
    </div>
  );
}
