import type { Metadata } from 'next';
import AppDashboardPage from './_dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard | SSB',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppDashboardPage />;
}
