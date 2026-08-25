import { createClient } from '@/lib/supabase/server';

/**
 * Retrieves high-level dashboard metrics and recent activity for the admin overview.
 * @param {string|null} [token]
 * @returns {Promise<Object>}
 */
export async function getAdminOverviewStats(token = null) {
  try {
    const supabase = await createClient(token);

    // 1. Fetch mobiles for counts
    const { data: mobiles, error: mobErr } = await supabase
      .from('mobiles')
      .select('id, is_featured, is_hidden');

    const totalMobilesCount = mobiles?.length || 0;
    const featuredMobilesCount = mobiles?.filter((m) => m.is_featured).length || 0;

    // 2. Fetch all orders for status counts and revenue
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, order_number, customer_id, customer_name, customer_email, customer_phone, total_amount, status, payment_status, created_at')
      .order('created_at', { ascending: false });

    // 3. Fetch inquiries
    const { data: inquiries, error: inqErr } = await supabase
      .from('contact_inquiries')
      .select('id, name, email, subject, message, status, created_at')
      .order('created_at', { ascending: false });

    // 4. Fetch customer profiles
    const { data: customerProfiles } = await supabase
      .from('customer_profiles')
      .select('id, created_at');

    // 5. Fetch reviews count
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, is_hidden');

    const totalOrdersCount = orders?.length || 0;
    const pendingOrdersCount = orders?.filter((o) => o.status === 'pending').length || 0;
    const confirmedOrdersCount = orders?.filter((o) => o.status === 'confirmed').length || 0;
    const processingOrdersCount = orders?.filter((o) => o.status === 'processing').length || 0;
    const shippedOrdersCount = orders?.filter((o) => o.status === 'shipped').length || 0;
    const deliveredOrdersCount = orders?.filter((o) => o.status === 'delivered').length || 0;
    const cancelledOrdersCount = orders?.filter((o) => o.status === 'cancelled').length || 0;
    const totalRevenue = orders?.filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

    const newInquiriesCount = inquiries?.filter((i) => !i.status || i.status === 'new' || i.status === 'unread').length || 0;
    const totalInquiriesCount = inquiries?.length || 0;

    const totalCustomers = customerProfiles?.length || 0;
    const customersWithOrders = new Set((orders || []).map((o) => o.customer_id).filter(Boolean)).size;
    const totalReviews = reviews?.length || 0;

    const recentOrders = (orders || []).slice(0, 5);
    const recentInquiries = (inquiries || []).slice(0, 5);

    return {
      totalMobiles: totalMobilesCount,
      featuredMobiles: featuredMobilesCount,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      confirmedOrders: confirmedOrdersCount,
      processingOrders: processingOrdersCount,
      shippedOrders: shippedOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      cancelledOrders: cancelledOrdersCount,
      newInquiries: newInquiriesCount,
      totalInquiries: totalInquiriesCount,
      totalRevenue,
      totalCustomers,
      customersWithOrders,
      totalReviews,
      recentOrders,
      recentInquiries,
    };
  } catch (err) {
    console.error('Error in getAdminOverviewStats:', err.message);
    return {
      totalMobiles: 0,
      featuredMobiles: 0,
      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      newInquiries: 0,
      totalInquiries: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      customersWithOrders: 0,
      totalReviews: 0,
      recentOrders: [],
      recentInquiries: [],
    };
  }
}

/**
 * Retrieves all mobiles for the admin panel with search, filtering, and sorting.
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export async function getAdminMobiles(options = {}) {
  try {
    const { search, brand, stockStatus, featured, visibility, sort } = options;
    const supabase = await createClient();

    let query = supabase
      .from('mobiles')
      .select('*, mobile_images(*)');

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
    }

    if (brand && typeof brand === 'string' && brand !== 'all') {
      query = query.eq('brand', brand.trim());
    }

    if (stockStatus && typeof stockStatus === 'string' && stockStatus !== 'all') {
      query = query.eq('stock_status', stockStatus.trim());
    }

    if (featured === 'true' || featured === true) {
      query = query.eq('is_featured', true);
    } else if (featured === 'false' || featured === false) {
      query = query.eq('is_featured', false);
    }

    if (visibility === 'visible') {
      query = query.eq('is_hidden', false);
    } else if (visibility === 'hidden') {
      query = query.eq('is_hidden', true);
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'price-low-high') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high-low') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.order('display_order', {
      referencedTable: 'mobile_images',
      ascending: true,
    });

    const { data, error } = await query;
    if (error) {
      console.error('Error in getAdminMobiles:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getAdminMobiles:', err.message);
    return [];
  }
}

/**
 * Retrieves a single mobile by ID for editing.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getAdminMobileById(id) {
  if (!id || typeof id !== 'string') return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mobiles')
      .select('*, mobile_images(*)')
      .eq('id', id)
      .order('display_order', { referencedTable: 'mobile_images', ascending: true })
      .maybeSingle();

    if (error) {
      console.error('Error in getAdminMobileById:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error in getAdminMobileById:', err.message);
    return null;
  }
}

/**
 * Creates a new mobile product with optional images.
 * @param {Object} mobileData
 * @param {Array<{ imageUrl: string, displayOrder: number }>} [images=[]]
 * @returns {Promise<{ success: boolean, mobile?: Object, error?: string }>}
 */
export async function createMobile(mobileData, images = [], token = null) {
  try {
    const supabase = await createClient(token);

    const priceNum = Number(mobileData.price);
    const origPriceNum = mobileData.original_price ? Number(mobileData.original_price) : null;

    const payload = {
      brand: mobileData.brand.trim(),
      name: mobileData.name.trim(),
      price: priceNum,
      original_price: origPriceNum,
      ram: mobileData.ram.trim(),
      storage: mobileData.storage.trim(),
      processor: mobileData.processor?.trim() || null,
      display: mobileData.display?.trim() || null,
      camera: mobileData.camera?.trim() || null,
      battery: mobileData.battery?.trim() || null,
      description: mobileData.description?.trim() || null,
      stock_status: mobileData.stock_status || 'in_stock',
      is_featured: Boolean(mobileData.is_featured),
      is_hidden: Boolean(mobileData.is_hidden),
    };

    const { data: newMobile, error: mobErr } = await supabase
      .from('mobiles')
      .insert([payload])
      .select()
      .maybeSingle();

    if (mobErr) {
      console.error('Error inserting mobile:', mobErr.message);
      return { success: false, error: mobErr.message };
    }

    if (!newMobile) {
      return { success: false, error: 'Mobile creation failed. No record was returned from database.' };
    }

    // Insert image records if provided
    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images.slice(0, 5).map((img, idx) => ({
        mobile_id: newMobile.id,
        image_url: img.imageUrl.trim(),
        public_id: `url_${Date.now()}_${idx}`,
        display_order: typeof img.displayOrder === 'number' ? img.displayOrder : idx,
      }));

      const { error: imgErr } = await supabase.from('mobile_images').insert(imageRecords);
      if (imgErr) {
        console.error('Error inserting mobile images:', imgErr.message);
      }
    }

    return { success: true, mobile: newMobile };
  } catch (err) {
    console.error('Unexpected error in createMobile:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing mobile product and replaces its images.
 * @param {string} id
 * @param {Object} mobileData
 * @param {Array<{ imageUrl: string, displayOrder: number }>} [images]
 * @param {string|null} [token]
 * @returns {Promise<{ success: boolean, mobile?: Object, error?: string }>}
 */
export async function updateMobile(id, mobileData, images, token = null) {
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid mobile ID' };
  }

  try {
    const supabase = await createClient(token);

    const priceNum = Number(mobileData.price);
    const origPriceNum = mobileData.original_price ? Number(mobileData.original_price) : null;

    const payload = {
      brand: mobileData.brand.trim(),
      name: mobileData.name.trim(),
      price: priceNum,
      original_price: origPriceNum,
      ram: mobileData.ram.trim(),
      storage: mobileData.storage.trim(),
      processor: mobileData.processor?.trim() || null,
      display: mobileData.display?.trim() || null,
      camera: mobileData.camera?.trim() || null,
      battery: mobileData.battery?.trim() || null,
      description: mobileData.description?.trim() || null,
      stock_status: mobileData.stock_status || 'in_stock',
      is_featured: Boolean(mobileData.is_featured),
      is_hidden: Boolean(mobileData.is_hidden),
    };

    const { data: updated, error: updateErr } = await supabase
      .from('mobiles')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error('Error updating mobile:', updateErr.message);
      return { success: false, error: updateErr.message };
    }

    if (!updated) {
      return {
        success: false,
        error: 'Mobile was not updated. It may not exist or your admin session is not permitted to update it.',
        code: 'MOBILE_NOT_UPDATED',
      };
    }

    // If images array is provided, replace existing images
    if (Array.isArray(images)) {
      await supabase.from('mobile_images').delete().eq('mobile_id', id);

      if (images.length > 0) {
        const imageRecords = images.slice(0, 5).map((img, idx) => ({
          mobile_id: id,
          image_url: img.imageUrl.trim(),
          public_id: `url_${Date.now()}_${idx}`,
          display_order: typeof img.displayOrder === 'number' ? img.displayOrder : idx,
        }));

        await supabase.from('mobile_images').insert(imageRecords);
      }
    }

    return { success: true, mobile: updated };
  } catch (err) {
    console.error('Unexpected error in updateMobile:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a mobile and its associated images.
 * @param {string} id
 * @param {string|null} [token]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteMobile(id, token = null) {
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid mobile ID' };
  }

  try {
    const supabase = await createClient(token);
    const { data: deletedRows, error } = await supabase
      .from('mobiles')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('Error deleting mobile:', error.message);
      return {
        success: false,
        error:
          error.code === '23503'
            ? 'This mobile cannot be deleted because it is referenced by an existing order.'
            : error.code === '42501'
              ? 'You do not have permission to delete this mobile.'
              : error.message,
        code: error.code,
      };
    }

    if (!deletedRows?.length) {
      return {
        success: false,
        error: 'Mobile was not deleted. It may not exist or your admin session is not permitted to delete it.',
        code: 'MOBILE_NOT_DELETED',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteMobile:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves orders for the admin panel with search, filtering, and sorting.
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export async function getAdminOrders(options = {}) {
  try {
    const { search, status, paymentStatus, sort } = options;
    const supabase = await createClient();

    let query = supabase
      .from('orders')
      .select('*, order_items(*), customer_profiles(id, full_name, phone)');

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query = query.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%`
      );
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.eq('status', status.trim());
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus.trim());
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'amount-high-low') {
      query = query.order('total_amount', { ascending: false });
    } else if (sort === 'amount-low-high') {
      query = query.order('total_amount', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error in getAdminOrders:', error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getAdminOrders:', err.message);
    throw err;
  }
}

/**
 * Retrieves a single order with its items for admin detail view.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getAdminOrderById(id) {
  if (!id || typeof id !== 'string') return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), customer_profiles(id, full_name, phone)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error in getAdminOrderById:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error in getAdminOrderById:', err.message);
    return null;
  }
}

/**
 * Updates order status and/or payment status.
 * @param {string} id
 * @param {Object} updates
 * @param {string} [updates.status]
 * @param {string} [updates.payment_status]
 * @returns {Promise<{ success: boolean, order?: Object, error?: string }>}
 */
export async function updateOrderStatus(id, updates = {}, token = null) {
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid order ID' };
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  const payload = {};
  if (updates.status && validStatuses.includes(updates.status)) {
    payload.status = updates.status;
  }
  if (updates.payment_status && validPaymentStatuses.includes(updates.payment_status)) {
    payload.payment_status = updates.payment_status;
  }

  if (Object.keys(payload).length === 0) {
    return { success: false, error: 'No valid status updates provided' };
  }

  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error in updateOrderStatus:', error.message);
      return { success: false, error: error.message, code: error.code };
    }

    if (!data) {
      return {
        success: false,
        error: 'Order was not updated. It may not exist or the current admin session is not permitted to update it.',
        code: 'ORDER_NOT_UPDATED',
      };
    }

    return { success: true, order: data };
  } catch (err) {
    console.error('Unexpected error in updateOrderStatus:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves inquiries for admin panel.
 * @param {Object} options
 * @param {string|null} [token]
 * @returns {Promise<Array>}
 */
export async function getAdminInquiries(options = {}, token = null) {
  try {
    const { search, status } = options;
    const supabase = await createClient(token);

    let query = supabase
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, created_at')
      .order('created_at', { ascending: false });

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      if (status === 'new') {
        query = query.or('status.eq.new,status.eq.unread,status.is.null');
      } else {
        query = query.eq('status', status.trim());
      }
    }

    const { data, error } = await query;

    if (process.env.NODE_ENV === 'development') {
      console.log('Admin inquiries query result:', {
        count: data?.length ?? 0,
        error: error?.message ?? null,
      });
    }

    if (error) {
      console.error('Error in getAdminInquiries:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getAdminInquiries:', err.message);
    return [];
  }
}

/**
 * Retrieves single inquiry by ID.
 * @param {string} id
 * @param {string|null} [token]
 * @returns {Promise<Object|null>}
 */
export async function getAdminInquiryById(id, token = null) {
  if (!id || typeof id !== 'string') return null;

  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error in getAdminInquiryById:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error in getAdminInquiryById:', err.message);
    return null;
  }
}

/**
 * Updates inquiry status ('new', 'read', 'resolved').
 * @param {string} id
 * @param {string} status
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function updateInquiryStatus(id, status, token = null) {
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid inquiry ID' };
  }

  const validStatuses = ['new', 'read', 'resolved'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid inquiry status' };
  }

  try {
    const supabase = await createClient(token);
    const { data, error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, phone, subject, message, status, created_at')
      .maybeSingle();

    if (error) {
      console.error('Error in updateInquiryStatus:', error.message);
      return { success: false, error: error.message };
    }

    if (!data) {
      return {
        success: false,
        error: 'Inquiry was not updated. It may not exist or your admin session is not permitted to update it.',
        code: 'INQUIRY_NOT_UPDATED',
      };
    }

    return { success: true, inquiry: data };
  } catch (err) {
    console.error('Unexpected error in updateInquiryStatus:', err.message);
    return { success: false, error: err.message };
  }
}
