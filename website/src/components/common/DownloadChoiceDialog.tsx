/**
 * Download Choice Dialog
 *
 * A professional dialog that lets users choose between GitHub and SourceForge,
 * then encourages them to star/review the project.
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Download, ExternalLink, Github, Star, MessageSquare, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GITHUB_RELEASES = 'https://github.com/trexolab-dev/emark-pdf-signer/releases';
const GITHUB_REPO = 'https://github.com/trexolab-dev/emark-pdf-signer';
const SOURCEFORGE_PROJECT = 'https://sourceforge.net/projects/emark-pdf-signer/';
const SOURCEFORGE_REVIEWS = 'https://sourceforge.net/projects/emark-pdf-signer/reviews/';

interface DownloadChoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type DialogStep = 'choose' | 'thank-you';

export function DownloadChoiceDialog({ isOpen, onClose }: DownloadChoiceDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState<DialogStep>('choose');
  const [downloadSource, setDownloadSource] = useState<'github' | 'sourceforge' | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setStep('choose');
      setDownloadSource(null);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleDownload = useCallback((source: 'github' | 'sourceforge') => {
    setDownloadSource(source);
    const url = source === 'github' ? GITHUB_RELEASES : SOURCEFORGE_PROJECT;
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('thank-you');
  }, []);

  const handleSupportAction = useCallback(() => {
    const url = downloadSource === 'github' ? GITHUB_REPO : SOURCEFORGE_REVIEWS;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  }, [downloadSource, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-choice-title"
        className={`fixed left-1/2 top-1/2 z-[10000] w-full max-w-md -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isAnimating
            ? 'opacity-100 scale-100 -translate-y-1/2'
            : 'opacity-0 scale-95 -translate-y-[45%]'
        }`}
      >
        <div className="relative mx-4 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 shadow-2xl shadow-primary/10">
          {/* Animated background gradients */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/15 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all z-20 group"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </button>

          {/* Content */}
          <div className="relative p-6 sm:p-8">
            {step === 'choose' ? (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-4">
                    <Download className="w-7 h-7 text-primary" />
                  </div>
                  <h2 id="download-choice-title" className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Download eMark PDF Signer
                  </h2>
                  <p className="text-sm text-slate-400">
                    Choose your preferred download source
                  </p>
                </div>

                {/* Download Options */}
                <div className="space-y-3">
                  {/* GitHub Option */}
                  <button
                    onClick={() => handleDownload('github')}
                    className="group w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 ring-1 ring-slate-700/50 hover:ring-primary/40 hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                      <Github className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">GitHub Releases</div>
                      <div className="text-xs text-slate-500">Latest version • Fast CDN</div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                  </button>

                  {/* SourceForge Option */}
                  <button
                    onClick={() => handleDownload('sourceforge')}
                    className="group w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 ring-1 ring-slate-700/50 hover:ring-orange-500/40 hover:bg-slate-800/80 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center group-hover:bg-orange-500/15 transition-colors shrink-0">
                      <svg className="w-6 h-6 text-slate-300 group-hover:text-orange-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-orange-500 transition-colors">SourceForge</div>
                      <div className="text-xs text-slate-500">Mirror • Alternative location</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors shrink-0" />
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-slate-500 text-center mt-5">
                  Both sources provide the same official release
                </p>
              </>
            ) : (
              /* Thank You / Support Request Step */
              <div className="animate-[fadeIn_0.3s_ease-out]">
                {/* Success Icon */}
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/30 to-primary/30 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center ring-1 ring-emerald-500/30">
                      <Sparkles className="w-7 h-7 text-emerald-400" />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Download Started!
                  </h2>
                  <p className="text-sm text-slate-400">
                    Your download should begin shortly
                  </p>
                </div>

                {/* Support Request Card */}
                <div className="relative p-5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 mb-5">
                  {/* Decorative elements */}
                  <div className="absolute top-3 right-3 text-amber-400/20">
                    <Star className="w-5 h-5 fill-current" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      {downloadSource === 'github' ? (
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {downloadSource === 'github'
                          ? "Enjoying eMark PDF Signer? Star us on GitHub!"
                          : "Love eMark PDF Signer? Leave a review!"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {downloadSource === 'github'
                          ? "Your star helps others discover eMark PDF Signer and motivates our development. It only takes a second!"
                          : "Your review helps others find the right tool. Share your experience on SourceForge!"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSupportAction}
                    className="w-full gap-2.5 h-11 btn-gradient text-white border-0 group shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    {downloadSource === 'github' ? (
                      <>
                        <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">Star on GitHub</span>
                        <Star className="w-4 h-4 text-amber-300 fill-amber-300/50 transition-all group-hover:rotate-12 group-hover:scale-110" />
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">Write a Review</span>
                        <Star className="w-4 h-4 text-amber-300 fill-amber-300/50" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full h-10 text-slate-400 hover:text-white hover:bg-slate-800/60"
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Community note */}
                <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <Heart className="w-3 h-3 text-pink-500/70 fill-pink-500/50" />
                  Thank you for supporting open source!
                </p>
              </div>
            )}
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default DownloadChoiceDialog;
