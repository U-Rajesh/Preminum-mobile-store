import { createClient } from '@/lib/supabase/server';

/**
 * Retrieves visible reviews (is_hidden = false) for the storefront.
 * @param {number} [limit=12]
 * @returns {Promise<Array>} List of visible reviews with associated mobile product details.
 */
export async function getVisibleReviews(limit = 12) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('reviews')
      .select('id, customer_name, customer_role, rating, title, review_text, customer_avatar, is_hidden, created_at, mobile_id, mobiles(id, name, brand)')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching visible reviews:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getVisibleReviews:', err.message);
    return [];
  }
}

/**
 * Retrieves all approved reviews for a specific mobile smartphone product.
 * @param {string} mobileId
 * @returns {Promise<Array>}
 */
export async function getReviewsForMobile(mobileId) {
  if (!mobileId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, customer_role, rating, title, review_text, created_at')
      .eq('mobile_id', mobileId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching reviews for mobile ${mobileId}:`, error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getReviewsForMobile:', err.message);
    return [];
  }
}

/**
 * Retrieves all reviews authored by a specific customer.
 * @param {string} customerId
 * @returns {Promise<Array>}
 */
export async function getCustomerReviews(customerId) {
  if (!customerId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, title, review_text, is_hidden, created_at, mobile_id, mobiles(id, name, brand)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching customer reviews for ${customerId}:`, error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getCustomerReviews:', err.message);
    return [];
  }
}

/**
 * Creates a new customer review.
 * @param {Object} reviewData
 * @returns {Promise<{ success: boolean, review?: Object, error?: string }>}
 */
export async function createReview(reviewData, token = null) {
  try {
    const { mobileId, rating, title, reviewText, customerName, customerRole, customerId } = reviewData;

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return { success: false, error: 'Rating must be between 1 and 5 stars.' };
    }

    if (!reviewText || !reviewText.trim()) {
      return { success: false, error: 'Review text is required.' };
    }

    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        mobile_id: mobileId || null,
        customer_id: customerId || null,
        customer_name: customerName || 'Verified Customer',
        customer_role: customerRole || 'Verified Buyer',
        rating: ratingNum,
        title: title ? title.trim() : null,
        review_text: reviewText.trim(),
        is_hidden: false,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, review: data };
  } catch (err) {
    console.error('Error in createReview service:', err.message);
    return { success: false, error: 'Failed to submit review.' };
  }
}

/**
 * Admin: Retrieves all reviews with optional filtering and search.
 * @param {Object} params
 * @param {string|null} [token]
 * @returns {Promise<Array>}
 */
export async function getAdminReviews(params = {}, token = null) {
  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, customer_role, rating, title, review_text, is_hidden, created_at, mobile_id, mobiles(id, name, brand)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getAdminReviews:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getAdminReviews:', err.message);
    return [];
  }
}

/**
 * Admin: Toggles review visibility (hide/unhide).
 * @param {string} reviewId
 * @param {boolean} isHidden
 * @param {string|null} [token]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function toggleReviewVisibility(reviewId, isHidden, token = null) {
  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_hidden: Boolean(isHidden) })
      .eq('id', reviewId)
      .select('id, is_hidden')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    if (!data) {
      return {
        success: false,
        error: 'Review was not updated. It may not exist or your admin session is not permitted to update it.',
        code: 'REVIEW_NOT_UPDATED',
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: Deletes a review.
 * @param {string} reviewId
 * @param {string|null} [token]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteReview(reviewId, token = null) {
  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .select('id')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    if (!data) {
      return {
        success: false,
        error: 'Review was not deleted. It may not exist or your admin session is not permitted to delete it.',
        code: 'REVIEW_NOT_DELETED',
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
