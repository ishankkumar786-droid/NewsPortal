import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Khabarpath',
  description: 'Get in touch with the Khabarpath team for news tips, feedback, and inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
