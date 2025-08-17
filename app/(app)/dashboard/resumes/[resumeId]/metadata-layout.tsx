import { Metadata } from 'next';
import { generateResumeEditorMetadata } from '@/lib/page-metadata';

interface Props {
  params: { resumeId: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: { resumeId: string } }): Promise<Metadata> {
  // In a real implementation, you would fetch the resume data here
  // For now, we'll use a default implementation
  return generateResumeEditorMetadata(params.resumeId);
}

export default function ResumeMetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}