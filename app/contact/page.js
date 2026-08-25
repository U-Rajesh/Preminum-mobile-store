import { MapPin, Clock, Mail, Phone } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import StoreLocationMap from '@/components/contact/StoreLocationMap';
import styles from './contact.module.css';

export const metadata = {
  title: 'Contact Customer Support & Store Location',
  description: 'Get in touch with the MOBILÉ team for flagship smartphone inquiries, warranty assistance, order tracking, and store visits.',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Contact Hero */}
        <header className={styles.hero}>
          <span className={styles.eyebrow}>We&apos;re Here to Help</span>
          <h1 className={styles.title}>Let’s talk about your next mobile.</h1>
          <p className={styles.subtitle}>
            Have a question about a device, availability, or your next purchase?
            Reach out to the MOBILÉ team.
          </p>
        </header>

        {/* Two-Column Responsive Layout */}
        <div className={styles.layoutGrid}>
          {/* Left Column: Contact Information & Store Location */}
          <div className={styles.leftCol}>
            {/* Store Info Card */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>Contact Details</h2>

              <div className={styles.infoList}>
                {/* Location */}
                <div className={styles.infoItem}>
                  <MapPin size={20} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoContent}>
                    <span className={styles.infoHeading}>Store Location</span>
                    <span className={styles.infoValue}>
                      Kondapur Sri Ram Nagar Store, Hyderabad, Telangana, India
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className={styles.infoItem}>
                  <Clock size={20} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoContent}>
                    <span className={styles.infoHeading}>Business Hours</span>
                    <span className={styles.infoValue}>
                      Monday – Saturday: 10:00 AM – 8:00 PM
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className={styles.infoItem}>
                  <Mail size={20} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoContent}>
                    <span className={styles.infoHeading}>Email Support</span>
                    <a
                      href="mailto:urajeshrajesh01@gmail.com"
                      className={`${styles.infoValue} ${styles.infoLink}`}
                    >
                      urajeshrajesh01@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className={styles.infoItem}>
                  <Phone size={20} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoContent}>
                    <span className={styles.infoHeading}>Direct Call</span>
                    <a
                      href="tel:+918919998495"
                      className={`${styles.infoValue} ${styles.infoLink}`}
                    >
                      +91 8919998495
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Store Card with Interactive Map & Geolocation */}
            <StoreLocationMap />
          </div>

          {/* Right Column: Inquiry Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
