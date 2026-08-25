import { createClient } from '@/lib/supabase/server';

/**
 * Creates and persists a new contact inquiry in the Supabase database.
 * @param {Object} data Inquiry data
 * @param {string} data.name Full name of the customer
 * @param {string} data.email Email address of the customer
 * @param {string} [data.phone] Optional contact phone number
 * @param {string} data.subject Subject/topic of inquiry
 * @param {string} data.message Detailed inquiry message
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function createContactInquiry(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid inquiry data' };
  }

  const { name, email, phone, subject, message, id } = data;
  const inquiryId = id || crypto.randomUUID();

  const payload = {
    id: inquiryId,
    name: typeof name === 'string' ? name.trim() : '',
    email: typeof email === 'string' ? email.trim() : '',
    phone: typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : null,
    subject: typeof subject === 'string' ? subject.trim() : '',
    message: typeof message === 'string' ? message.trim() : '',
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('contact_inquiries')
      .insert([payload]);

    if (error) {
      console.error('Error inserting contact inquiry into Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, inquiry: payload };
  } catch (err) {
    console.error('Unexpected error in createContactInquiry:', err.message);
    return { success: false, error: err.message };
  }
}
