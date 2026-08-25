'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import styles from './detail.module.css';

export default function MobileDetailError({ error, reset }) {
  useEffect(() => {
    console.error('Mobile detail error:', error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.notFoundState} role="alert">
          <AlertCircle size={44} className={styles.notFoundIcon} aria-hidden="true" />
          <h1 className={styles.notFoundTitle}>Unable to load this mobile</h1>
          <p className={styles.notFoundText}>
            Something went wrong while loading the product. Please try again or
            explore our other smartphones.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Try again</span>
            </button>
            <Link
              href="/mobiles"
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Mobiles</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
