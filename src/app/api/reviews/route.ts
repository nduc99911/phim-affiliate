import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(reviews || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newReview = await request.json();
    
    // Kiểm tra trùng secretCode
    if (newReview.secretCode) {
      const { data: existingCode } = await supabase
        .from('reviews')
        .select('id')
        .eq('secretCode', newReview.secretCode)
        .maybeSingle();
        
      if (existingCode) {
        return NextResponse.json({ error: 'Mã phim đã tồn tại' }, { status: 409 });
      }
    }
    
    if (!newReview.slug) {
      newReview.slug = newReview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    // Kiểm tra trùng slug
    const { data: existingSlug } = await supabase
      .from('reviews')
      .select('id')
      .eq('slug', newReview.slug)
      .maybeSingle();
      
    if (existingSlug) {
      return NextResponse.json({ error: 'Phim đã tồn tại (trùng tên)' }, { status: 409 });
    }

    newReview.clicks = 0;

    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select();

    if (error) throw error;
    
    return NextResponse.json({ success: true, review: data[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
