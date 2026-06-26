import Link from 'next/link';
import { Newspaper, Twitter, Facebook, Instagram, Youtube, Mail } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-news-dark text-gray-300" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="h-6 w-6 text-news-red" />
              <span className="font-serif font-bold text-xl text-white">Khabarpath</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted source for breaking news, in-depth analysis, and the stories that matter.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="hover:text-news-red transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-news-red transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-news-red transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-news-red transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="/contact" aria-label="Contact us" className="hover:text-news-red transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Sections</h3>
            <ul className="space-y-2 text-sm">
              {['Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Health'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/category/${item.toLowerCase()}`}
                    className="hover:text-news-red transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-news-red transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-news-red transition-colors">Contact</Link></li>
              <li><Link href="/advertise" className="hover:text-news-red transition-colors">Advertise</Link></li>
              <li><Link href="/careers" className="hover:text-news-red transition-colors">Careers</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-news-red transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-news-red transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-news-red transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/cookies" className="hover:text-news-red transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Khabarpath. All rights reserved.</p>
          <p>Built with Next.js & Node.js</p>
        </div>
      </div>
    </footer>
  );
}
