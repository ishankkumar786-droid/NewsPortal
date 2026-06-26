import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us - Khabarpath',
  description: 'Learn about our mission, vision, and the team behind Khabarpath.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 text-center">About Khabarpath</h1>
      
      <div className="aspect-[21/9] relative rounded-2xl overflow-hidden mb-12">
        <Image 
          src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop" 
          alt="Newsroom"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-white text-2xl md:text-3xl font-medium font-serif max-w-2xl text-center px-4">
            "Delivering truth, integrity, and timely journalism to millions globally."
          </p>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-3xl font-bold font-serif text-news-red">Our Mission</h2>
          <p>
            Founded in 2026, Khabarpath was established with a singular mission: to provide unbiased, rapid, and comprehensive news coverage to a global audience. In an era of misinformation, we stand as a pillar of journalistic integrity, ensuring that our readers receive only verified and well-researched reporting.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold font-serif text-news-red">Our Values</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none pl-0 mt-6">
            <li className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-2 mt-0">Integrity First</h3>
              <p className="text-sm mb-0">We never compromise on the truth. Our fact-checking process is rigorous and multi-layered.</p>
            </li>
            <li className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-2 mt-0">Speed & Accuracy</h3>
              <p className="text-sm mb-0">We aim to be the first to break news, but never at the expense of reporting accuracy.</p>
            </li>
            <li className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-2 mt-0">Global Perspective</h3>
              <p className="text-sm mb-0">Our diverse team of reporters brings local context to international stories.</p>
            </li>
            <li className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-2 mt-0">Editorial Independence</h3>
              <p className="text-sm mb-0">Our newsroom operates completely independent of our advertising partners and corporate interests.</p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold font-serif text-news-red">The Team</h2>
          <p>
            Our newsroom is powered by over 50 dedicated journalists, editors, and technical experts working around the clock. From our investigative teams to our breaking news desk, every member of Khabarpath is committed to excellence in journalism.
          </p>
        </section>
      </div>
    </div>
  );
}
