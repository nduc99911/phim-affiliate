import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    // Tạm thời bỏ qua nếu là request từ bot hoặc trang admin
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const { error } = await supabase
      .from('page_views')
      .insert([{ path }]);

    if (error) {
      console.error('Track error:', error);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
