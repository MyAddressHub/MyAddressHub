import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { token, uidb64, password, password2 } = await request.json();
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, uidb64, password, password2 }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to reset password' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 