import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Code2, FileSignature, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO, structuredDataGenerators } from '@/components/common';
import { ORG } from '@/utils/constants';

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  icon: React.ElementType;
  featured?: boolean;
}

// Static project data - no GitHub API calls
const PROJECTS: Project[] = [
  {
    id: 1,
    name: 'eMark PDF Signer',
    description: 'Professional PDF digital signature software. Sign documents with DSC tokens, PKCS#11/PKCS#12 certificates. Free and open-source.',
    url: 'https://github.com/trexolab-dev/emark-pdf-signer',
    language: 'Java',
    icon: FileSignature,
    featured: true,
  },
];

export function Projects() {
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      Java: 'bg-orange-500',
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      HTML: 'bg-red-500',
      CSS: 'bg-purple-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
    };
    return colors[language] || 'bg-gray-400';
  };

  const breadcrumbStructuredData = structuredDataGenerators.breadcrumb([
    { name: 'Home', url: 'https://trexolab-dev.github.io/emark-pdf-signer/' },
    { name: 'Projects', url: 'https://trexolab-dev.github.io/emark-pdf-signer/#/projects' },
  ]);

  return (
    <>
      <SEO
        title="Open Source Projects by TrexoLab"
        description="Explore open-source projects from TrexoLab. Discover PDF signing tools, developer utilities, and more free software projects."
        keywords="TrexoLab projects, open source software, free developer tools, PDF signing projects, Java applications"
        url="https://trexolab-dev.github.io/emark-pdf-signer/#/projects"
        structuredData={breadcrumbStructuredData}
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">Projects</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Our Projects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Open-source software projects from {ORG.name}.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROJECTS.map((project, index) => (
                <a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass-card p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up ${
                    project.featured ? 'ring-2 ring-primary/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <project.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${getLanguageColor(project.language)}`} />
                      <span>{project.language}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* GitHub Organization Link */}
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                View more projects on our GitHub organization
              </p>
              <a
                href={ORG.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Visit {ORG.name} on GitHub
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Projects;
