import SamplesPage from '../page';

// This page exists for SEO purposes - the layout.tsx contains all the metadata
// We render the samples page directly with the finance category pre-selected
export default function FinanceSamplesPage() {
  return <SamplesPage defaultCategory="finance" />;
}
