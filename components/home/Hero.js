'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero Section">
      <div className="container">
        <div className={styles.grid}>
          {/* Left Column: Typography & CTAs */}
          <div className={styles.content}>
            {/* Eyebrow */}
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <span>New Generation Smartphones</span>
            </div>

            {/* Headline */}
            <h1 className={styles.headline}>
              Technology,
              <span className={styles.headlineHighlight}>Refined.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p className={styles.paragraph}>
              A curated collection of modern smartphones built around performance,
              design, and everyday experience.
            </p>

            {/* Call To Actions */}
            <div className={styles.ctaGroup}>
              <Link href="/mobiles" className={styles.primaryCta}>
                <span>Explore Mobiles</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link href="/mobiles" className={styles.secondaryCta}>
                <span>Collection</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Smartphone Visual */}
          <div className={styles.visualWrapper}>
            <div className={styles.backdropGlow} aria-hidden="true" />
            <div className={styles.orbitRingOuter} aria-hidden="true" />
            <div className={styles.orbitRingInner} aria-hidden="true" />
            <div className={styles.glowArc} aria-hidden="true" />

            <div className={styles.imageContainer}>
              <Image
                src="/images/hero-phone.jpg"
                alt="Premium modern flagship smartphone"
                fill
                priority
                sizes="(max-width: 768px) 340px, (max-width: 1024px) 400px, 440px"
                className={styles.phoneImage}
              />
            </div>
            <div className={styles.floorShadow} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
