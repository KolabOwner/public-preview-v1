import SamplesPage from '../page';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// We render the samples page directly with the education category pre-selected
export default function EducationSamplesPage() {
  return <SamplesPage defaultCategory="education" />;
}
