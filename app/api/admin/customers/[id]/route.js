import { NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/services/auth';
import { getAdminCustomerById } from '@/lib/services/customers';

export async function GET(request, { params }) {
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

    const { id } = await params;
    const customer = await getAdminCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (err) {
    console.error('Error in GET /api/admin/customers/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
