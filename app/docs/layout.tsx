import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | Rezum',
  description: 'Learn how to create professional resumes and optimize your job search with our comprehensive guides.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}