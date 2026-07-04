import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authCookie = request.cookies.get('admin_auth');
  const isAuthenticated = authCookie && authCookie.value === 'true';

  // 1. Bảo vệ toàn bộ trang Admin (trừ trang login)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Bảo vệ TẤT CẢ các API Thêm/Sửa/Xóa (chống hacker dùng postman hoặc curl để sửa link)
  if (path.startsWith('/api/') && !path.startsWith('/api/auth')) {
    if (request.method !== 'GET' && !isAuthenticated) {
      return NextResponse.json({ error: 'Truy cập bị từ chối. Hacker không có cửa đâu!' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
