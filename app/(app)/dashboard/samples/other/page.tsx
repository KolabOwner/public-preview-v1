import SamplesPage from '../page';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// We render the samples page directly with the other category pre-selected
export default function OtherSamplesPage() {
  return <SamplesPage defaultCategory="other" />;
}
