import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * Generates a human-friendly unique order number.
 * Format: MOB-YYYYMMDD-XXXXXX (e.g. MOB-20260824-7A9B3F)
 * @returns {string}
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MOB-${dateStr}-${randomSuffix}`;
}

/**
 * Validates stock status and server-side prices, creates order and order items in Supabase.
 * @param {Object} params
 * @param {Object} params.customer
 * @param {string} params.customer.name
 * @param {string} params.customer.email
 * @param {string} params.customer.phone
 * @param {string} params.customer.addressLine1
 * @param {string} [params.customer.addressLine2]
 * @param {string} params.customer.city
 * @param {string} params.customer.state
 * @param {string} params.customer.pincode
 * @param {Array<{ productId: string, quantity: number }>} params.items
 * @returns {Promise<{ success: boolean, order?: Object, error?: string, code?: string }>}
 */
export async function createOrder({ customer, items }) {
  if (!customer || typeof customer !== 'object') {
    return { success: false, error: 'Customer information is required.', code: 'INVALID_CUSTOMER' };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'Order must contain at least one item.', code: 'EMPTY_ITEMS' };
  }

  // Validate items structure and sanitize quantities
  const sanitizedItems = [];
  for (const item of items) {
    const rawId = item?.productId || item?.id;
    if (!item || typeof rawId !== 'string' || !rawId.trim()) {
      return { success: false, error: 'Invalid product in order.', code: 'INVALID_PRODUCT' };
    }
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Invalid item quantity.', code: 'INVALID_QUANTITY' };
    }
    sanitizedItems.push({ productId: rawId.trim(), quantity: qty });
  }

  try {
    const supabase = await createClient();

    // 1. Fetch authoritative product records from database (ignoring any client-sent prices)
    const productIds = sanitizedItems.map((i) => i.productId);
    const { data: dbProducts, error: fetchErr } = await supabase
      .from('mobiles')
      .select('id, name, brand, price, stock_status, is_hidden, mobile_images(image_url, display_order)')
      .in('id', productIds);

    if (fetchErr) {
      console.error('Database error fetching products for order:', fetchErr.message);
      return { success: false, error: 'Database error verifying products.', code: 'DB_ERROR' };
    }

    if (!dbProducts || dbProducts.length === 0) {
      return { success: false, error: 'Products could not be found.', code: 'NOT_FOUND' };
    }

    // Map database products by ID for fast lookup
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Validate product availability and stock
    let subtotal = 0;
    const orderItemsPayload = [];

    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);

      if (!product || product.is_hidden) {
        return {
          success: false,
          error: `Product "${product?.name || item.productId}" is currently unavailable.`,
          code: 'PRODUCT_UNAVAILABLE',
        };
      }

      if (product.stock_status === 'out_of_stock') {
        return {
          success: false,
          error: `Product "${product.name}" is out of stock.`,
          code: 'OUT_OF_STOCK',
        };
      }

      const unitPrice = Number(product.price);
      if (isNaN(unitPrice) || unitPrice < 0) {
        return {
          success: false,
          error: `Invalid pricing for "${product.name}".`,
          code: 'INVALID_PRICE',
        };
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      // Extract primary image URL snapshot
      let imageUrl = null;
      if (Array.isArray(product.mobile_images) && product.mobile_images.length > 0) {
        const sortedImages = [...product.mobile_images].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        imageUrl = sortedImages[0].image_url;
      }

      orderItemsPayload.push({
        product_id: product.id,
        product_name: product.name,
        brand: product.brand || null,
        image_url: imageUrl,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: lineTotal,
      });
    }

    const shippingAmount = 0;
    const totalAmount = subtotal + shippingAmount;
    const orderNumber = generateOrderNumber();
    const orderId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    // 3. Insert parent order into database
    const { error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          id: orderId,
          order_number: orderNumber,
          customer_id: customer.customerId || customer.customer_id || null,
          customer_name: customer.name.trim(),
          customer_email: customer.email.trim(),
          customer_phone: customer.phone.trim(),
          address_line1: customer.addressLine1.trim(),
          address_line2: customer.addressLine2?.trim() || null,
          city: customer.city.trim(),
          state: customer.state.trim(),
          pincode: customer.pincode.trim(),
          subtotal,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          created_at: nowIso,
          updated_at: nowIso,
        },
      ]);

    if (orderErr) {
      console.error('Error inserting order into Supabase:', orderErr.message);
      return { success: false, error: orderErr.message, code: 'DB_ERROR' };
    }

    // 4. Attach order_id to line items and insert snapshot
    const itemRecords = orderItemsPayload.map((item) => ({
      id: crypto.randomUUID(),
      ...item,
      order_id: orderId,
      created_at: nowIso,
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(itemRecords);

    if (itemsErr) {
      console.error('Error inserting order items:', itemsErr.message);
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch {}
      return { success: false, error: 'Failed to create order line items.', code: 'DB_ERROR' };
    }

    return {
      success: true,
      order: {
        id: orderId,
        orderNumber,
        order_number: orderNumber,
        customer_id: customer.customerId || customer.customer_id || null,
        status: 'pending',
        payment_status: 'pending',
        subtotal,
        shipping_amount: shippingAmount,
        total: totalAmount,
        total_amount: totalAmount,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim(),
        customer_phone: customer.phone.trim(),
        email: customer.email.trim(),
        createdAt: nowIso,
        created_at: nowIso,
      },
    };
  } catch (err) {
    console.error('Unexpected error in createOrder service:', err.message);
    return { success: false, error: err.message, code: 'SERVER_ERROR' };
  }
}

/**
 * Retrieves order details by order number for confirmation page.
 * @param {string} orderNumber
 * @returns {Promise<{ success: boolean, order?: Object, error?: string }>}
 */
export async function getOrderByNumber(orderNumber) {
  if (!orderNumber || typeof orderNumber !== 'string') {
    return { success: false, error: 'Invalid order number' };
  }

  try {
    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        subtotal,
        shipping_amount,
        total_amount,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          brand,
          image_url,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('order_number', orderNumber.trim())
      .maybeSingle();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, order };
  } catch (err) {
    console.error('Error in getOrderByNumber:', err.message);
    return { success: false, error: err.message };
  }
}
