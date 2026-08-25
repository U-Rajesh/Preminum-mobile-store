'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Check, AlertCircle } from 'lucide-react';
import styles from './InquiryDetailView.module.css';

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Validates standard email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Builds email subject, body, and the Gmail compose URL.
 * @param {Object} inquiry
 * @returns {Object|null}
 */
function getGmailData(inquiry) {
  if (!inquiry || !inquiry.email || !isValidEmail(inquiry.email)) {
    return null;
  }

  const recipient = inquiry.email.trim();
  const customerName = inquiry.name && inquiry.name.trim() ? inquiry.name.trim() : 'Valued Customer';
  const inquirySubject = inquiry.subject && inquiry.subject.trim() ? inquiry.subject.trim() : 'your inquiry';

  const subjectText = `Re: ${inquirySubject}`;
  const bodyText = `Hello ${customerName},\n\nThank you for contacting us regarding ${inquirySubject}.\n\nWe would be happy to assist you with your inquiry.\n\nBest regards,\nMobile Store Admin`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

  return {
    recipient,
    customerName,
    subjectText,
    bodyText,
    gmailUrl,
  };
}

export default function InquiryDetailView({ initialInquiry }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState(initialInquiry);
  const [status, setStatus] = useState(initialInquiry.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const emailData = useMemo(() => getGmailData(inquiry), [inquiry]);
  const hasValidEmail = Boolean(emailData);

  const handleReplyViaGmail = (e) => {
    if (!emailData || !emailData.gmailUrl) {
      if (e) e.preventDefault();
      console.warn('Cannot reply via Gmail: customer email is unavailable or invalid.');
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[InquiryDetailView] Opening Gmail compose:', {
        customerEmail: emailData.recipient,
        subject: emailData.subjectText,
        gmailUrl: emailData.gmailUrl,
      });
    }

    // Attempt to open in a new tab via window.open, with anchor fallback
    const newWindow = window.open(emailData.gmailUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      if (e) e.preventDefault();
    }
  };

  const handleStatusChange = async (nextStatus) => {
    setStatus(nextStatus);
    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setInquiry((prev) => ({ ...prev, status: nextStatus }));
        setFeedback({ type: 'success', message: 'Status updated to ' + nextStatus });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/admin/inquiries" className={styles.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back to Inquiries</span>
      </Link>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          }}
          role="status"
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.label}>Inquiry Subject</span>
            <h1 className={styles.subject}>{inquiry.subject}</h1>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
            Received on {formatDate(inquiry.created_at)}
          </div>
        </div>

        {/* Customer Information Grid */}
        <div className={styles.customerGrid}>
          <div className={styles.customerItem}>
            <span className={styles.label}>Customer Name</span>
            <span className={styles.value}>{inquiry.name}</span>
          </div>

          <div className={styles.customerItem}>
            <span className={styles.label}>Email Address</span>
            <span className={styles.value}>{inquiry.email}</span>
          </div>

          <div className={styles.customerItem}>
            <span className={styles.label}>Phone Number</span>
            <span className={styles.value}>{inquiry.phone || 'Not provided'}</span>
          </div>
        </div>

        {/* Full Message */}
        <div className={styles.messageBox}>
          <span className={styles.label}>Customer Message</span>
          <div className={styles.messageText}>{inquiry.message}</div>
        </div>

        {/* Actions & Status Changer */}
        <div className={styles.actionsRow}>
          <div className={styles.statusGroup}>
            <span className={styles.label}>Status:</span>
            <select
              value={status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={styles.select}
              aria-label="Change inquiry status"
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {hasValidEmail ? (
            <a
              href={emailData.gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReplyViaGmail}
              className="btn btn-primary"
              style={{ height: '40px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              aria-label={`Reply via Gmail to ${emailData.recipient}`}
            >
              <Mail size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Reply via Gmail</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="btn btn-primary"
              style={{ height: '40px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', opacity: 0.6, cursor: 'not-allowed' }}
              title="Customer email address is unavailable."
              aria-label="Customer email address is unavailable"
            >
              <Mail size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Reply via Gmail</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
