import { redirect } from 'next/navigation';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// Redirect to main samples page with category parameter
export default function EngineeringSamplesPage() {
  redirect('/dashboard/samples?category=engineering');
}
