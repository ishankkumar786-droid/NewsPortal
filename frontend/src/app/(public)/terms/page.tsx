import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Khabarpath',
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Terms and Conditions</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: June 1, 2026</p>
        
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Khabarpath ("Company", "we", "us", or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>

        <h2>3. User Representations</h2>
        <p>By using the Site, you represent and warrant that:</p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Use.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
          <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
        </ul>

        <h2>4. Prohibited Activities</h2>
        <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
        
        <h2>5. Modifications and Interruptions</h2>
        <p>
          We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time.
        </p>

        <h2>6. Governing Law</h2>
        <p>
          These Terms shall be governed by and defined following the laws of the jurisdiction in which the Company is established. Khabarpath and yourself irrevocably consent that the courts of that jurisdiction shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
        </p>
      </div>
    </div>
  );
}
