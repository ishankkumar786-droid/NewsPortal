'use client';

import { useState } from 'react';
import { Phone, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-center">Contact Us</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Have a news tip, feedback, or inquiry? We&apos;d love to hear from you. Reach out to our team using the form below or through our contact details.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-muted rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold font-serif text-news-red">Get In Touch</h2>
            <p className="text-sm text-muted-foreground">
              Whether you have a story tip, a question, or just want to say hello — we are always here to listen.
            </p>
          </div>

          <a
            href="tel:+919936027719"
            className="flex items-center gap-4 bg-muted rounded-2xl p-6 hover:bg-muted/80 transition-colors group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-news-red/10 text-news-red group-hover:bg-news-red group-hover:text-white transition-colors">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Phone</p>
              <p className="font-semibold">+91 9936027719</p>
            </div>
          </a>

          <a
            href="mailto:birendrakesarwani4005@gmail.com"
            className="flex items-center gap-4 bg-muted rounded-2xl p-6 hover:bg-muted/80 transition-colors group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-news-red/10 text-news-red group-hover:bg-news-red group-hover:text-white transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</p>
              <p className="font-semibold text-sm">birendrakesarwani4005@gmail.com</p>
            </div>
          </a>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-muted rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold font-serif">Send Us a Message</h2>

            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl border border-green-500/20">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">Your message has been sent successfully! We&apos;ll get back to you soon.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-500/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium">
                  Full Name <span className="text-news-red">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-news-red/50 focus:border-news-red transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium">
                  Email Address <span className="text-news-red">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-news-red/50 focus:border-news-red transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-subject" className="text-sm font-medium">
                Subject <span className="text-news-red">*</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                minLength={3}
                maxLength={200}
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-news-red/50 focus:border-news-red transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                Message <span className="text-news-red">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-news-red/50 focus:border-news-red transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-news-red text-white font-semibold hover:bg-news-red/90 focus:outline-none focus:ring-2 focus:ring-news-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
