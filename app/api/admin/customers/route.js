import { NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/services/auth';
import { getAdminCustomers } from '@/lib/services/customers';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminCheck = await verifyAdminUser(token);
    if (!adminCheck.authorized) {
      const status = adminCheck.reason === 'unauthenticated' ? 401 : 403;
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status }
      );
    }

    const customers = await getAdminCustomers();

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (err) {
    console.error('Error in GET /api/admin/customers:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
