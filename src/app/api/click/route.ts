import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    
    // Lấy thông tin review hiện tại
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, clicks, secretCode, affiliateLink')
      .eq('slug', slug)
      .single();

    if (fetchError || !review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    const newClicks = (review.clicks || 0) + 1;

    // Cập nhật lượt click
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ clicks: newClicks })
      .eq('id', review.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      clicks: newClicks,
      secretCode: review.secretCode,
      affiliateLink: review.affiliateLink
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
