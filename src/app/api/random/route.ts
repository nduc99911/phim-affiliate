import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
    
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    if (!count) {
      return NextResponse.redirect(new URL('/', baseUrl));
    }
    
    // Tạo index ngẫu nhiên
    const randomIndex = Math.floor(Math.random() * count);
    
    const { data } = await supabase
      .from('reviews')
      .select('slug')
      .range(randomIndex, randomIndex)
      .single();
    
    if (data?.slug) {
      return NextResponse.redirect(new URL(`/${data.slug}`, baseUrl));
    }
    
    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (error) {
    console.error('Random error:', error);
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    return NextResponse.redirect(new URL('/', baseUrl));
  }
}
