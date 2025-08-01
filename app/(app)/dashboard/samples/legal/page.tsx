import SamplesPage from '../page';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// We render the samples page directly with the legal category pre-selected
export default function LegalSamplesPage() {
  return <SamplesPage defaultCategory="legal" />;
}
