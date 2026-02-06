import { Instagram, Facebook, Youtube, Phone, MapPin, Shield } from 'lucide-react';

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/lanconqld/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/lanconqld', label: 'Facebook' },
  { icon: Youtube, href: 'https://www.youtube.com/channel/UC-_gfZawuqAMgUvot4yYeIQ', label: 'YouTube' },
];

export function DashboardFooter() {
  return (
    <footer className="border-t border-border/40 bg-primary text-primary-foreground mt-12">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <a 
                href="tel:1300699442" 
                className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
              >
                <Phone className="h-4 w-4" />
                <span>1300 699 442</span>
              </a>
              <div className="flex items-start gap-2 opacity-90">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>21/8 Metroplex Avenue, Murarrie Qld 4172</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Shield className="h-4 w-4" />
                <span>QBCC License No. 1172942</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">Follow Us</h3>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-3 md:text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">LanCon Qld</h3>
            <p className="text-sm opacity-70">
              Internal Metrics Dashboard
            </p>
            <p className="text-xs opacity-50">
              © {new Date().getFullYear()} LanCon Qld. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
