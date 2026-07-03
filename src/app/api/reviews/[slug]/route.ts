import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('slug', slug);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const updatedData = await request.json();
    
    // Xóa các trường không nên update
    delete updatedData.id;
    delete updatedData.created_at;
    delete updatedData.slug; // Không cho phép đổi slug để tránh lỗi link cũ

    const { data, error } = await supabase
      .from('reviews')
      .update(updatedData)
      .eq('slug', slug)
      .select();

    if (error) throw error;
    
    return NextResponse.json({ success: true, review: data?.[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
