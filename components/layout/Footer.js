import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import styles from './Footer.module.css';

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'Mobiles', href: '/mobiles' },
  { label: 'Contact', href: '/contact' },
  { label: 'Admin Login', href: '/admin/login' },
];

function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.464-2.464l6.768-6.768" />
    </svg>
  );
}

function LinkedinIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
  { label: 'Twitter', icon: TwitterIcon, href: '#' },
  { label: 'LinkedIn', icon: LinkedinIcon, href: '#' },
];

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site Footer">
      <div className="container">
        <div className={styles.grid}>
          {/* Column 1: Brand & Description */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label="MOBILÉ Home">
              <span>MOBILÉ</span>
              <span className={styles.brandDot} aria-hidden="true" />
            </Link>
            <p className={styles.brandDesc}>
              Premium smartphones, carefully selected for modern mobile users.
            </p>
            <div className={styles.socialRow} aria-label="Social media links">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className={styles.socialLink}
                  aria-label={label}
                  rel="noopener noreferrer"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Explore Navigation */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>Explore</h3>
            <nav className={styles.linkList} aria-label="Footer Navigation">
              {exploreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.footerLink}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Store Information */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>Store</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <MapPin size={18} className={styles.infoIcon} aria-hidden="true" />
                <div>
                  <div>Kondapur Sri Ram Nagar Store</div>
                  <div>Hyderabad, Telangana, India</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Clock size={18} className={styles.infoIcon} aria-hidden="true" />
                <div>Mon–Sat: 10:00 AM – 8:00 PM</div>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Information */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>Contact</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Mail size={18} className={styles.infoIcon} aria-hidden="true" />
                <a
                  href="mailto:urajeshrajesh01@gmail.com"
                  className={styles.infoLink}
                >
                  urajeshrajesh01@gmail.com
                </a>
              </div>
              <div className={styles.infoItem}>
                <Phone size={18} className={styles.infoIcon} aria-hidden="true" />
                <a href="tel:+918919998495" className={styles.infoLink}>
                  +91 8919998495
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © 2026 MOBILÉ. All rights reserved.
          </div>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>
              Privacy Policy
            </a>
            <a href="#" className={styles.bottomLink}>
              Terms of Service
            </a>
            <Link href="/admin/login" className={styles.bottomLink} style={{ opacity: 0.8 }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
