import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Khabarpath',
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: June 1, 2026</p>
        
        <h2>1. Introduction</h2>
        <p>
          At Khabarpath, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Personal Data</h3>
        <p>
          We may collect personal identification information from users in a variety of ways, including, but not limited to, when users visit our site, register on the site, subscribe to the newsletter, and in connection with other activities, services, features, or resources we make available on our site.
        </p>
        
        <h3>Usage Data</h3>
        <p>
          We automatically collect certain information when you visit, use, or navigate the Site. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Site, and other technical information.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use personal information collected via our Site for a variety of business purposes described below:</p>
        <ul>
          <li>To facilitate account creation and logon process.</li>
          <li>To send you marketing and promotional communications.</li>
          <li>To deliver targeted advertising to you.</li>
          <li>To request feedback and to contact you about your use of our Site.</li>
          <li>To protect our Services from malicious activity.</li>
        </ul>

        <h2>4. Cookies and Web Beacons</h2>
        <p>
          We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at: privacy@newsportal.com
        </p>
      </div>
    </div>
  );
}
