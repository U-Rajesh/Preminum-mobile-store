'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './ContactForm.module.css';

/**
 * Validates standard email address format using regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setFieldErrors({});
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setServerError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setServerError('Unable to send your inquiry right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setServerError('');
    setFieldErrors({});
  };

  if (isSuccess) {
    return (
      <div className={styles.formContainer} role="status" aria-live="polite">
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
          <h3 className={styles.successTitle}>Thanks for reaching out.</h3>
          <p className={styles.successText}>
            Your inquiry has been received. Our team will get back to you soon.
          </p>
          <button
            type="button"
            onClick={handleResetForm}
            className={styles.resetFormBtn}
          >
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Send an Inquiry</h2>
      <p className={styles.formSubtitle}>
        Fill out the form below and we will get back to you promptly.
      </p>

      {serverError && (
        <div
          className={styles.errorBanner}
          role="alert"
          style={{ marginBottom: 'var(--space-5)' }}
        >
          <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Name and Email Row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              className={`${styles.input} ${
                fieldErrors.name ? styles.inputError : ''
              }`}
            />
            {fieldErrors.name && (
              <span id="name-error" className={styles.errorMessage}>
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={`${styles.input} ${
                fieldErrors.email ? styles.inputError : ''
              }`}
            />
            {fieldErrors.email && (
              <span id="email-error" className={styles.errorMessage}>
                {fieldErrors.email}
              </span>
            )}
          </div>
        </div>

        {/* Phone and Subject Row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
              <span className={styles.optionalTag}>(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 90000 00000"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              className={`${styles.input} ${
                fieldErrors.phone ? styles.inputError : ''
              }`}
            />
            {fieldErrors.phone && (
              <span id="phone-error" className={styles.errorMessage}>
                {fieldErrors.phone}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="subject" className={styles.label}>
              Subject *
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. iPhone 16 Pro Availability"
              aria-invalid={Boolean(fieldErrors.subject)}
              aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
              className={`${styles.input} ${
                fieldErrors.subject ? styles.inputError : ''
              }`}
            />
            {fieldErrors.subject && (
              <span id="subject-error" className={styles.errorMessage}>
                {fieldErrors.subject}
              </span>
            )}
          </div>
        </div>

        {/* Message Field */}
        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about the mobile you're looking for or your questions..."
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? 'message-error' : undefined}
            className={`${styles.textarea} ${
              fieldErrors.message ? styles.textareaError : ''
            }`}
          />
          {fieldErrors.message && (
            <span id="message-error" className={styles.errorMessage}>
              {fieldErrors.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
          aria-label="Send Inquiry"
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner} aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Inquiry</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
