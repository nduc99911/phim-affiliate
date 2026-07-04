import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    
    if (error || !data) {
      return NextResponse.json({ value: '' });
    }
    
    return NextResponse.json({ value: data.value });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    // Cần có bảng settings: key (text, PK), value (text)
    const { error } = await supabase.from('settings').upsert({ key, value });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lưu cài đặt' }, { status: 500 });
  }
}
