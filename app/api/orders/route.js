import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/services/orders';
import { createRazorpayOrder, isRazorpayConfigured } from '@/lib/services/payments';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminUser } from '@/lib/services/auth';

/**
 * Validates standard email address format using regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates 6-digit Indian PIN code format.
 * @param {string} pin
 * @returns {boolean}
 */
function isValidPincode(pin) {
  const pinRegex = /^[1-9][0-9]{5}$/;
  return pinRegex.test(pin);
}

/**
 * Validates phone number (contains digits and optional +, -, spaces, parentheses).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export async function POST(request) {
  try {
    // 1. Guard against admin accounts placing customer orders
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminCheck = await verifyAdminUser(token);

    if (adminCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin accounts are not permitted to place customer orders.',
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { customer, items } = body;
    const errors = {};

    if (!customer || typeof customer !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer information is required.',
          errors: { customer: 'Customer details are missing.' },
        },
        { status: 400 }
      );
    }

    // Validate Customer Name
    const trimmedName = typeof customer.name === 'string' ? customer.name.trim() : '';
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must be 100 characters or fewer.';
    }

    // Validate Email
    const trimmedEmail = typeof customer.email === 'string' ? customer.email.trim() : '';
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    } else if (trimmedEmail.length > 150) {
      errors.email = 'Email must be 150 characters or fewer.';
    }

    // Validate Phone
    const trimmedPhone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidPhone(trimmedPhone)) {
      errors.phone = 'Please enter a valid contact phone number.';
    } else if (trimmedPhone.length > 25) {
      errors.phone = 'Phone must be 25 characters or fewer.';
    }

    // Validate Address Line 1 (supports both addressLine1 and address_line1)
    const rawAddress1 = customer.addressLine1 || customer.address_line1;
    const trimmedAddress1 = typeof rawAddress1 === 'string' ? rawAddress1.trim() : '';
    if (!trimmedAddress1) {
      errors.addressLine1 = 'Street address is required.';
    } else if (trimmedAddress1.length > 250) {
      errors.addressLine1 = 'Address must be 250 characters or fewer.';
    }

    // Address Line 2 (optional, supports both addressLine2 and address_line2)
    const rawAddress2 = customer.addressLine2 || customer.address_line2;
    const trimmedAddress2 = typeof rawAddress2 === 'string' ? rawAddress2.trim() : '';
    if (trimmedAddress2 && trimmedAddress2.length > 250) {
      errors.addressLine2 = 'Address Line 2 must be 250 characters or fewer.';
    }

    // Validate City
    const trimmedCity = typeof customer.city === 'string' ? customer.city.trim() : '';
    if (!trimmedCity) {
      errors.city = 'City is required.';
    } else if (trimmedCity.length > 100) {
      errors.city = 'City must be 100 characters or fewer.';
    }

    // Validate State
    const trimmedState = typeof customer.state === 'string' ? customer.state.trim() : '';
    if (!trimmedState) {
      errors.state = 'State is required.';
    } else if (trimmedState.length > 100) {
      errors.state = 'State must be 100 characters or fewer.';
    }

    // Validate PIN Code (supports both pincode and pinCode)
    const rawPincode = customer.pincode || customer.pinCode;
    const trimmedPincode = typeof rawPincode === 'string' ? rawPincode.trim() : '';
    if (!trimmedPincode) {
      errors.pincode = 'PIN code is required.';
    } else if (!isValidPincode(trimmedPincode)) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code (e.g. 560001).';
    }

    // Validate Items Array (supports both productId and id)
    if (!Array.isArray(items) || items.length === 0) {
      errors.items = 'Your order must contain at least one product.';
    } else {
      const invalidItems = items.some((i) => {
        const prodId = i?.productId || i?.id;
        const qty = parseInt(i?.quantity, 10);
        return !i || !prodId || isNaN(qty) || qty <= 0;
      });
      if (invalidItems) {
        errors.items = 'One or more items in your cart contain invalid product data.';
      }
    }

    // If client validation fails, return 400 Bad Request
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please check your order details.',
          errors,
        },
        { status: 400 }
      );
    }

    // Check if user is authenticated to associate order with customer profile
    let customerId = null;
    try {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        customerId = authData.user.id;
      }
    } catch {}

    // Never trust a customer ID supplied by the browser. If the request is
    // authenticated, associate the order with the authenticated Supabase user.
    // Guest checkout remains supported with customerId = null.

    // Execute order creation via service layer
    const result = await createOrder({
      customer: {
        customerId,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        addressLine1: trimmedAddress1,
        addressLine2: trimmedAddress2 || null,
        city: trimmedCity,
        state: trimmedState,
        pincode: trimmedPincode,
      },
      items,
    });

    if (!result.success) {
      if (
        result.code === 'OUT_OF_STOCK' ||
        result.code === 'PRODUCT_UNAVAILABLE'
      ) {
        return NextResponse.json(
          { success: false, message: result.error },
          { status: 409 }
        );
      }

      if (
        result.code === 'NOT_FOUND' ||
        result.code === 'INVALID_PRODUCT' ||
        result.code === 'INVALID_QUANTITY' ||
        result.code === 'EMPTY_ITEMS'
      ) {
        return NextResponse.json(
          { success: false, message: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Unable to place your order right now. Please try again.',
        },
        { status: 500 }
      );
    }

    // Generate Razorpay Order if configured
    let payment = null;
    if (isRazorpayConfigured()) {
      const payResult = await createRazorpayOrder({
        orderId: result.order.id,
        orderNumber: result.order.order_number,
        amountInRupees: result.order.total_amount,
      });

      if (payResult.success) {
        payment = {
          configured: true,
          keyId: payResult.keyId,
          razorpayOrderId: payResult.razorpayOrder.id,
          amount: payResult.razorpayOrder.amount,
          currency: payResult.razorpayOrder.currency,
        };
      } else {
        payment = {
          configured: false,
          error: payResult.error,
        };
      }
    } else {
      payment = {
        configured: false,
        message: 'Payment gateway is not configured.',
      };
    }

    return NextResponse.json(
      {
        success: true,
        order: result.order,
        payment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error in POST /api/orders:', err.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to place your order right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
