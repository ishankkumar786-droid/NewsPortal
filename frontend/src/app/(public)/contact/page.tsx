import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Contact Us - KhabarPatra',
  description: 'Get in touch with the KhabarPatra team for tips, feedback, and inquiries.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We value your feedback and news tips. Reach out to our editorial team, advertising department, or support staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select id="department" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Editorial (News Tips)</option>
                <option>Advertising</option>
                <option>Technical Support</option>
                <option>General Inquiry</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea 
                id="message" 
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="How can we help you?"
              />
            </div>
            
            <Button type="button" className="w-full bg-news-red hover:bg-news-red/90 text-white">
              Send Message
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-muted rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-news-red" /> Headquarters
            </h3>
            <p className="text-muted-foreground">
              123 Journalism Way, Suite 400<br />
              New York, NY 10001<br />
              United States
            </p>
          </div>

          <div className="bg-muted rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mail className="text-news-red" /> Email Contacts
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">News Tips:</strong> tips@newsportal.com</p>
              <p><strong className="text-foreground">Advertising:</strong> ads@newsportal.com</p>
              <p><strong className="text-foreground">Support:</strong> support@newsportal.com</p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="text-news-red" /> Phone
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Main Desk:</strong> +1 (555) 123-4567</p>
              <p><strong className="text-foreground">Toll Free:</strong> +1 (800) 987-6543</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
