import { createClient } from '@/lib/supabase/server';

/**
 * Validates and normalizes the sort parameter.
 * Supported values: 'normal', 'price-low-high', 'price-high-low'
 * @param {string} sort
 * @returns {'normal' | 'price-low-high' | 'price-high-low'}
 */
function getValidSortOption(sort) {
  const allowedSorts = ['normal', 'price-low-high', 'price-high-low'];
  if (sort && allowedSorts.includes(sort)) {
    return sort;
  }
  return 'normal';
}

/**
 * Retrieves all visible mobiles (is_hidden = false) with their related images.
 * Images are ordered by display_order ascending.
 * @returns {Promise<Array>} List of visible mobiles or empty array.
 */
export async function getVisibleMobiles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mobiles')
      .select('*, mobile_images(*)')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .order('display_order', { referencedTable: 'mobile_images', ascending: true });

    if (error) {
      console.error('Error fetching visible mobiles:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getVisibleMobiles:', err.message);
    return [];
  }
}

/**
 * Retrieves featured visible mobiles (is_hidden = false, is_featured = true).
 * Ordered by creation date descending with a configurable limit (default: 8).
 * @param {number} limit Maximum number of products to return (default: 8)
 * @returns {Promise<Array>} List of featured mobiles or empty array.
 */
export async function getFeaturedMobiles(limit = 8) {
  try {
    const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 8;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mobiles')
      .select('*, mobile_images(*)')
      .eq('is_hidden', false)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .order('display_order', { referencedTable: 'mobile_images', ascending: true })
      .limit(safeLimit);

    if (error) {
      console.error('Error fetching featured mobiles:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getFeaturedMobiles:', err.message);
    return [];
  }
}

/**
 * Retrieves a single visible mobile by UUID with its related images.
 * @param {string} id UUID of the mobile
 * @returns {Promise<Object|null>} Mobile object or null if not found/hidden.
 */
export async function getMobileById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mobiles')
      .select('*, mobile_images(*)')
      .eq('id', id)
      .eq('is_hidden', false)
      .order('display_order', { referencedTable: 'mobile_images', ascending: true })
      .maybeSingle();

    if (error) {
      console.error('Error fetching mobile by ID:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error in getMobileById:', err.message);
    return null;
  }
}

/**
 * Flexible query function supporting search, RAM, Storage filtering, and sorting.
 * @param {Object} options Query parameters
 * @param {string} [options.search] Text search against mobile name
 * @param {string} [options.ram] Exact RAM match (e.g. '8GB', '12GB')
 * @param {string} [options.storage] Exact Storage match (e.g. '128GB', '256GB')
 * @param {'normal' | 'price-low-high' | 'price-high-low'} [options.sort='normal'] Sorting mode
 * @returns {Promise<Array>} List of filtered/sorted mobiles or empty array.
 */
export async function getMobiles(options = {}) {
  try {
    const { search, ram, storage, sort } = options;
    const supabase = await createClient();

    let query = supabase
      .from('mobiles')
      .select('*, mobile_images(*)')
      .eq('is_hidden', false);

    // Search filter across mobile name and brand
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = search.trim();
      query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
    }

    // Filter by exact RAM
    if (ram && typeof ram === 'string' && ram.trim().length > 0) {
      query = query.eq('ram', ram.trim());
    }

    // Filter by exact Storage
    if (storage && typeof storage === 'string' && storage.trim().length > 0) {
      query = query.eq('storage', storage.trim());
    }

    // Apply sorting
    const validatedSort = getValidSortOption(sort);
    if (validatedSort === 'price-low-high') {
      query = query.order('price', { ascending: true });
    } else if (validatedSort === 'price-high-low') {
      query = query.order('price', { ascending: false });
    } else {
      // 'normal' sort: newest products first
      query = query.order('created_at', { ascending: false });
    }

    // Order related images by display_order ascending
    query = query.order('display_order', {
      referencedTable: 'mobile_images',
      ascending: true,
    });

    const { data, error } = await query;

    if (error) {
      console.error('Error in getMobiles query:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getMobiles:', err.message);
    return [];
  }
}
