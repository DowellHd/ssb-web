import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackSoon } from '@/components/back-soon';
import { BACK_SOON } from '@/lib/back-soon';

const TITLE = "We'll be back soon | Smart Strategies Builder";
const DESCRIPTION =
  'Smart Strategies Builder is temporarily unavailable. Thanks for your patience.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.smartstrategiesbuilder.ai' },
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function BackSoonPage() {
  if (!BACK_SOON) notFound();
  return <BackSoon />;
}
