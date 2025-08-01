import SamplesPage from '../page';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// We render the samples page directly with the design category pre-selected
export default function DesignSamplesPage() {
  return <SamplesPage defaultCategory="design" />;
}
