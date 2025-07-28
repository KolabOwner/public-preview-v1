// Redirect to business samples as default
import { redirect } from 'next/navigation';

export default function SamplesPage() {
  redirect('/dashboard/samples/business');
}