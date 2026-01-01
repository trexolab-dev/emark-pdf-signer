export interface Diagram {
  id: string;
  src: string;
  title: string;
  description: string;
  category: 'architecture' | 'workflow' | 'sequence' | 'component';
}

const BASE = import.meta.env.BASE_URL;

export const diagrams: Diagram[] = [
  {
    id: 'system-architecture',
    src: `${BASE}diagrams/System_Architecture_Diagram.svg`,
    title: 'System Architecture',
    description: 'High-level overview of eMark system components and their relationships. Shows the main modules including PDF processing, certificate management, and signature validation.',
    category: 'architecture',
  },
  {
    id: 'workflow',
    src: `${BASE}diagrams/Workflow.svg`,
    title: 'Signing Workflow',
    description: 'Step-by-step workflow diagram showing the complete PDF signing process from document loading to final signed output.',
    category: 'workflow',
  },
  {
    id: 'sequence',
    src: `${BASE}diagrams/Sequence_Diagram.svg`,
    title: 'Sequence Diagram',
    description: 'Detailed sequence diagram illustrating the interaction between user, UI, and backend components during the signing operation.',
    category: 'sequence',
  },
  {
    id: 'component-interaction',
    src: `${BASE}diagrams/Component_Interaction_Diagram.svg`,
    title: 'Component Interaction',
    description: 'Shows how different components of eMark communicate with each other, including PKCS#11 integration and certificate store access.',
    category: 'component',
  },
];

export const categoryLabels: Record<Diagram['category'], string> = {
  architecture: 'Architecture',
  workflow: 'Workflow',
  sequence: 'Sequence',
  component: 'Component',
};

export const diagramCategoryColors: Record<Diagram['category'], { bg: string; text: string }> = {
  architecture: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  workflow: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  sequence: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  component: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};
