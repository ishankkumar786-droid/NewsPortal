import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Contact Us - Khabarpath',
  description: 'Get in touch with the Khabarpath team for tips, feedback, and inquiries.',
};

export default function ContactPage() {
  notFound();
}
