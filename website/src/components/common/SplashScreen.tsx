import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

export function SplashScreen({ onLoadComplete, minDisplayTime = 1500 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animation phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 100),   // Document appears
      setTimeout(() => setAnimationPhase(2), 400),   // Pen starts signing
      setTimeout(() => setAnimationPhase(3), 1200),  // Signature complete
      setTimeout(() => setAnimationPhase(4), 1500),  // Checkmark appears
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Loading progress and completion logic
  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = Math.random() * 10 + 4;
        return Math.min(prev + increment, 100);
      });
    }, 130);

    const checkReady = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            onLoadComplete?.();
          }, 600);
        }, 400);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      checkReady();
    } else {
      window.addEventListener('load', checkReady);
    }

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('load', checkReady);
    };
  }, [minDisplayTime, onLoadComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-out ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{ background: 'linear-gradient(145deg, #080c14 0%, #0c1424 50%, #0a1220 100%)' }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Central Animation Container - Document with Signing */}
        <div
          className={`relative mb-8 transition-all duration-700 ease-out ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Document Icon */}
          <div className="relative">
            {/* Document shadow/glow */}
            <div
              className={`absolute inset-0 transition-all duration-1000 ${
                animationPhase >= 4 ? 'opacity-60' : 'opacity-30'
              }`}
              style={{
                background: animationPhase >= 4
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(14, 165, 233, 0.3))'
                  : 'linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(6, 182, 212, 0.2))',
                filter: 'blur(25px)',
                borderRadius: '12px',
                transform: 'scale(1.2)',
              }}
            />

            {/* Document body */}
            <div
              className="relative w-20 h-28 rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Document corner fold */}
              <div
                className="absolute top-0 right-0 w-5 h-5"
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, #334155 50%)',
                }}
              />

              {/* Document lines (text representation) */}
              <div className="absolute top-4 left-3 right-6 space-y-2">
                <div className="h-1 bg-slate-600/40 rounded-full w-full" />
                <div className="h-1 bg-slate-600/30 rounded-full w-4/5" />
                <div className="h-1 bg-slate-600/30 rounded-full w-full" />
                <div className="h-1 bg-slate-600/20 rounded-full w-3/5" />
              </div>

              {/* Signature area at bottom */}
              <div className="absolute bottom-3 left-3 right-3">
                {/* Signature line */}
                <div className="h-[1px] bg-slate-500/40 mb-1" />

                {/* Animated signature stroke */}
                <svg
                  className="w-full h-4 overflow-visible"
                  viewBox="0 0 56 16"
                  fill="none"
                >
                  <path
                    d="M2 12 C8 4, 12 14, 18 8 S26 2, 32 10 S40 14, 48 6 L54 8"
                    stroke="url(#signatureGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    className={`transition-all duration-700 ${
                      animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      strokeDasharray: 80,
                      strokeDashoffset: animationPhase >= 2 ? 0 : 80,
                      transition: 'stroke-dashoffset 0.8s ease-out, opacity 0.3s',
                    }}
                  />
                  <defs>
                    <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Green verification badge */}
              <div
                className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                  animationPhase >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline
                    points="20 6 9 17 4 12"
                    style={{
                      strokeDasharray: 24,
                      strokeDashoffset: animationPhase >= 4 ? 0 : 24,
                      transition: 'stroke-dashoffset 0.4s ease-out 0.2s',
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Signing pen */}
            <div
              className={`absolute transition-all duration-700 ease-out ${
                animationPhase >= 2
                  ? animationPhase >= 3
                    ? 'opacity-0 translate-x-8 -translate-y-4'
                    : 'opacity-100 -right-3 bottom-6'
                  : 'opacity-0 right-4 bottom-16'
              }`}
              style={{
                transform: animationPhase >= 2 && animationPhase < 3
                  ? 'rotate(-45deg)'
                  : 'rotate(-45deg) translateX(20px) translateY(-10px)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                {/* Pen body */}
                <path
                  d="M12 19l7-7 3 3-7 7-3-3z"
                  fill="url(#penGradient)"
                />
                <path
                  d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
                  fill="url(#penBodyGradient)"
                />
                <path
                  d="M2 2l4 4"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="penGradient" x1="12" y1="12" x2="22" y2="22">
                    <stop stopColor="#0ea5e9"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                  <linearGradient id="penBodyGradient" x1="2" y1="2" x2="18" y2="18">
                    <stop stopColor="#1e40af"/>
                    <stop offset="1" stopColor="#0ea5e9"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Security shield accent */}
            <div
              className={`absolute -left-4 top-1/2 -translate-y-1/2 transition-all duration-700 delay-300 ${
                animationPhase >= 1 ? 'opacity-40 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-500/60">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h1
          className={`text-3xl sm:text-4xl font-bold mb-2 tracking-tight transition-all duration-700 delay-100 ease-out ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            eMark PDF Signer
          </span>
        </h1>

        {/* Tagline */}
        <p
          className={`text-slate-400 text-sm mb-8 tracking-wide transition-all duration-700 delay-200 ease-out ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Professional PDF Signing Made Simple
        </p>

        {/* Feature pills */}
        <div
          className={`flex items-center gap-3 mb-8 transition-all duration-700 delay-300 ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="px-3 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Free
          </span>
          <span className="px-3 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Open Source
          </span>
          <span className="px-3 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            Secure
          </span>
        </div>

        {/* Progress bar */}
        <div
          className={`relative transition-all duration-700 delay-400 ease-out ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
            <div
              className="h-full rounded-full relative transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: progress >= 100
                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #22d3ee 100%)',
                boxShadow: progress >= 100
                  ? '0 0 16px rgba(16, 185, 129, 0.5)'
                  : '0 0 16px rgba(14, 165, 233, 0.4)',
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              {progress >= 100 ? 'Ready' : 'Loading'}
            </span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{
                background: progress >= 100
                  ? 'linear-gradient(135deg, #10b981, #22d3ee)'
                  : 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] transition-all duration-700 delay-500 ${
          animationPhase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-slate-500">100% Offline</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span className="text-slate-500">Legally Valid Signatures</span>
      </div>

      {/* Decorative corner elements */}
      <div className={`absolute top-5 left-5 transition-all duration-700 delay-600 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/30 to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-cyan-500/30 to-transparent" />
        </div>
      </div>
      <div className={`absolute top-5 right-5 transition-all duration-700 delay-700 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-cyan-500/30 to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-cyan-500/30 to-transparent" />
        </div>
      </div>
      <div className={`absolute bottom-5 left-5 transition-all duration-700 delay-700 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/30 to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-emerald-500/30 to-transparent" />
        </div>
      </div>
      <div className={`absolute bottom-5 right-5 transition-all duration-700 delay-600 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-emerald-500/30 to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-emerald-500/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
