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
    
    if (!newReview.slug) {
      newReview.slug = newReview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
