import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Keyword Targeting | Rezum Documentation',
  description: 'Learn how to use AI keyword targeting to optimize your resume for ATS systems and increase your interview rate.',
  keywords: 'AI keyword targeting, ATS optimization, resume keywords, job search, resume optimization',
};

export default function AIKeywordTargetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}