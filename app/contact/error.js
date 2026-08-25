'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import styles from './contact.module.css';

export default function ContactError({ error, reset }) {
  useEffect(() => {
    console.error('Contact page error:', error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div
          className={styles.infoCard}
          role="alert"
          style={{
            maxWidth: '540px',
            margin: '40px auto',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <AlertCircle size={44} style={{ color: '#dc2626' }} aria-hidden="true" />
          <h1 className={styles.cardTitle}>Unable to load this page</h1>
          <p style={{ color: 'var(--color-secondary)', fontSize: '0.9375rem', marginBottom: '16px' }}>
            Something went wrong while loading the contact page. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
