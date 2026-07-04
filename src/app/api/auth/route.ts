import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Mật khẩu đơn giản hardcode (có thể đổi)
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === expectedPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', expectedPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 // 1 day
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Sai mật khẩu' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
