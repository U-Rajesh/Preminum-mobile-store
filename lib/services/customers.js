import { createClient } from '@/lib/supabase/server';

/**
 * Retrieves the customer profile for the specified user ID.
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getCustomerProfile(userId) {
  if (!userId) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error('Error fetching customer profile:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getCustomerProfile:', err.message);
    return null;
  }
}

/**
 * Creates or updates a customer profile record.
 * @param {string} userId
 * @param {Object} profileData
 * @returns {Promise<{ success: boolean, profile?: Object, error?: string }>}
 */
export async function upsertCustomerProfile(userId, profileData) {
  if (!userId) return { success: false, error: 'User ID is required.' };
  try {
    const { fullName, phone } = profileData;

    if (!fullName || !fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .upsert({
        id: userId,
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (err) {
    console.error('Error in upsertCustomerProfile:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves orders belonging to the specified customer.
 * @param {string} customerId
 * @returns {Promise<Array>}
 */
export async function getCustomerOrders(customerId) {
  if (!customerId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getCustomerOrders:', err.message);
    return [];
  }
}

/**
 * Admin: Retrieves all registered customers with aggregate order metrics.
 * @returns {Promise<Array>}
 */
export async function getAdminCustomers() {
  try {
    const supabase = await createClient();

    // 1. Fetch customer profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.error('Error fetching admin customers:', profileErr.message);
      return [];
    }

    // 2. Fetch all orders to aggregate customer metrics
    const { data: orders } = await supabase
      .from('orders')
      .select('id, customer_id, customer_email, total_amount, created_at, status');

    // 3. Fetch reviews count
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, customer_id');

    const ordersMap = new Map();
    const spentMap = new Map();
    const lastOrderMap = new Map();
    const emailMap = new Map();

    (orders || []).forEach((o) => {
      if (o.customer_id) {
        ordersMap.set(o.customer_id, (ordersMap.get(o.customer_id) || 0) + 1);
        spentMap.set(o.customer_id, (spentMap.get(o.customer_id) || 0) + Number(o.total_amount || 0));
        if (o.customer_email) emailMap.set(o.customer_id, o.customer_email);

        const currentLast = lastOrderMap.get(o.customer_id);
        if (!currentLast || new Date(o.created_at) > new Date(currentLast)) {
          lastOrderMap.set(o.customer_id, o.created_at);
        }
      }
    });

    const reviewsMap = new Map();
    (reviews || []).forEach((r) => {
      if (r.customer_id) {
        reviewsMap.set(r.customer_id, (reviewsMap.get(r.customer_id) || 0) + 1);
      }
    });

    return (profiles || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      phone: p.phone,
      email: emailMap.get(p.id) || null,
      created_at: p.created_at,
      total_orders: ordersMap.get(p.id) || 0,
      total_spent: spentMap.get(p.id) || 0,
      last_order_at: lastOrderMap.get(p.id) || null,
      review_count: reviewsMap.get(p.id) || 0,
    }));
  } catch (err) {
    console.error('Unexpected error in getAdminCustomers:', err.message);
    return [];
  }
}

/**
 * Admin: Retrieves detailed customer information including their order history and authored reviews.
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getAdminCustomerById(customerId) {
  if (!customerId) return null;
  try {
    const supabase = await createClient();

    // 1. Customer profile
    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    if (error || !profile) {
      return null;
    }

    // 2. Customer orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    // 3. Customer reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, mobiles(id, name, brand)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    const totalSpent = (orders || []).reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const inferredEmail = orders?.[0]?.customer_email || null;

    return {
      ...profile,
      email: inferredEmail,
      total_orders: orders?.length || 0,
      total_spent: totalSpent,
      orders: orders || [],
      reviews: reviews || [],
    };
  } catch (err) {
    console.error('Unexpected error in getAdminCustomerById:', err.message);
    return null;
  }
}
