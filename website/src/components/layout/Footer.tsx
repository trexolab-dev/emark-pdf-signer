/**
 * Footer Component
 *
 * Site footer with branding, navigation links, and credits.
 * Uses centralized data from @/data/footer and @/lib/constants.
 */

import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
import {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  APP_SHORT_DESCRIPTION,
  AUTHOR,
  LICENSE,
  ORG,
} from '@/utils/constants';
import {
  FOOTER_SECTIONS,
  SOCIAL_ICON_LINKS,
  type FooterLink,
} from '@/data';
import { Tooltip } from '@/components/ui';

// Subcomponents for better organization
function FooterBranding() {
  return (
    <div className="lg:col-span-2">
      <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
        <div className="relative">
          <img
            src={`${import.meta.env.BASE_URL}images/logo.png`}
            alt={`${APP_NAME} Logo`}
            className="w-12 h-12 rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          />
          <div className="absolute inset-0 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div>
          <span className="text-2xl font-bold gradient-text">{APP_NAME}</span>
          <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </Link>
      <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-6">
        {APP_DESCRIPTION}
      </p>

      {/* Social links */}
      <div className="flex items-center gap-3">
        {SOCIAL_ICON_LINKS.map((social) => (
          <Tooltip key={social.name} content={social.ariaLabel} position="top">
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-slate-800/50 ring-1 ring-slate-700/50 flex items-center justify-center text-slate-400 ${social.hoverColor} hover:bg-slate-800 transition-all duration-300`}
              aria-label={social.ariaLabel}
            >
              <social.icon className="w-5 h-5" />
            </a>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

interface FooterLinkItemProps {
  link: FooterLink;
}

function FooterLinkItem({ link }: FooterLinkItemProps) {
  const className = "text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group";

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
        {link.name}
        <ExternalLink className="w-3 h-3 opacity-50" />
      </a>
    );
  }

  return (
    <Link to={link.href} className={className}>
      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
      {link.name}
    </Link>
  );
}

function FooterSection({ title, accentColor, links }: { title: string; accentColor: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-6 text-foreground flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${accentColor}`} />
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <FooterLinkItem link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterBottom() {
  return (
    <div className="mt-16 pt-8 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {ORG.name}. Released under{' '}
          <a
            href={LICENSE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {LICENSE.name}
          </a>
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          A product of{' '}
          <a
            href={ORG.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-cyan-400 transition-colors font-medium"
          >
            {ORG.name}
          </a>
        </p>
      </div>

      {/* Additional bottom info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground/60">
          {APP_SHORT_DESCRIPTION}
        </p>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-slate-950/50 backdrop-blur-xl overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 particle-grid opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <FooterBranding />

          {/* Link Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <FooterSection
              key={section.title}
              title={section.title}
              accentColor={section.accentColor}
              links={section.links}
            />
          ))}
        </div>

        {/* Bottom */}
        <FooterBottom />
      </div>
    </footer>
  );
}
