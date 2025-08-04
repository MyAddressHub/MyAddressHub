import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/reset-password-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Password reset email sent' });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to send reset email' },
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