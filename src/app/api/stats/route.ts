import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Để tối ưu và tránh lỗi timezone, chúng ta kéo toàn bộ dữ liệu page_views về (nếu ít)
    // Hoặc query theo ngày
    
    // Lấy ngày hiện tại (UTC để khớp với DB nếu DB lưu UTC)
    const now = new Date();
    
    // Khởi tạo các mốc thời gian
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7; 
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekIso = startOfWeek.toISOString();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    // Query song song để lấy count cho từng mốc thời gian
    const [
      { count: todayCount },
      { count: weekCount },
      { count: monthCount },
      { count: yearCount }
    ] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeekIso),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', startOfYear)
    ]);

    return NextResponse.json({
      today: todayCount || 0,
      week: weekCount || 0,
      month: monthCount || 0,
      year: yearCount || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải thống kê' }, { status: 500 });
  }
}
