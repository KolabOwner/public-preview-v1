import { redirect } from 'next/navigation';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// But we redirect to the main samples page with the category query param
export default function HealthcareSamplesPage() {
  redirect('/dashboard/samples?category=healthcare');
}
