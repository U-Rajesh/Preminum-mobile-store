import { NextResponse } from 'next/server';
import { createContactInquiry } from '@/lib/services/contact';

/**
 * Validates standard email address format using regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = body;
    const errors = {};

    // Validate Full Name
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must be 100 characters or fewer.';
    }

    // Validate Email
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    } else if (trimmedEmail.length > 150) {
      errors.email = 'Email must be 150 characters or fewer.';
    }

    // Validate Phone (optional)
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    if (trimmedPhone && trimmedPhone.length > 25) {
      errors.phone = 'Phone number must be 25 characters or fewer.';
    }

    // Validate Subject
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
    if (!trimmedSubject) {
      errors.subject = 'Subject is required.';
    } else if (trimmedSubject.length > 200) {
      errors.subject = 'Subject must be 200 characters or fewer.';
    }

    // Validate Message
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    if (!trimmedMessage) {
      errors.message = 'Message is required.';
    } else if (trimmedMessage.length > 3000) {
      errors.message = 'Message must be 3000 characters or fewer.';
    }

    // Return 400 if validation fails
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please check the highlighted fields.',
          errors,
        },
        { status: 400 }
      );
    }

    // Persist to Supabase database via service layer
    const result = await createContactInquiry({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || null,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unable to submit your inquiry right now. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your inquiry has been received. We'll get back to you soon.",
        inquiry: result.inquiry,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error handling contact submission:', err.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to submit your inquiry right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
