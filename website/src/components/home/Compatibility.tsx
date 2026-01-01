import { Check, FileText } from 'lucide-react';
import { LazyImage } from '@/components/ui/lazy-image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { compatibilityItems } from '@/data/compatibility';
import { ANIMATION } from '@/utils/constants';

export function Compatibility() {
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const { ref: visualRef, isVisible: visualVisible } = useScrollAnimation();

  return (
    <section id="compatibility" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div
            ref={contentRef}
            className={`transition-all duration-700 ${
              contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="gradient-text">Adobe Reader</span>
              <br />
              Compatible Signatures
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Documents signed with eMark are fully compatible with Adobe Reader DC and other
              major PDF applications. Your signatures will be recognized and validated across
              all platforms.
            </p>

            <ul className="space-y-4">
              {compatibilityItems.map((item, index) => (
                <li
                  key={item}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${ANIMATION.transitionNormal + index * ANIMATION.staggerDelay}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div
            ref={visualRef}
            className={`relative transition-all duration-700 ${
              visualVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="group relative p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/80 transition-all duration-500 ease-out">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center ring-1 ring-white/5 transition-all duration-500 group-hover:scale-105 group-hover:ring-white/10">
                  <FileText className="w-6 h-6 text-red-500 transition-all duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-500">Adobe Acrobat Compatible</h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-500">Industry standard PDF signatures</p>
                </div>
              </div>
              <LazyImage
                src={`${import.meta.env.BASE_URL}images/signed-pdf-view.png`}
                alt="Signed PDF in Adobe Reader"
                className="w-full h-auto rounded-lg object-contain"
              />
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-500">
                <Check className="w-4 h-4" />
                <span>Signature is valid and trusted</span>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className={`absolute top-2 right-2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 animate-float transition-all duration-700 z-10 ${
                visualVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{ transitionDelay: `${ANIMATION.transitionNormal + ANIMATION.staggerDelaySlow}ms` }}
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-foreground/90">PAdES Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
