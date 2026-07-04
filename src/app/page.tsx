import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

const ITEMS_PER_PAGE = 12;

async function getReviews(query: string = '', page: number = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let dbQuery = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
    
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,quote.ilike.%${query}%,content.ilike.%${query}%`);
  }

  const { data, error, count } = await dbQuery.range(from, to);
  
  if (error) {
    console.error('Lỗi khi tải dữ liệu từ Supabase:', error);
    return { data: [], count: 0 };
  }
  return { data, count: count || 0 };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const { q = '', page = '1' } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const { data: reviews, count } = await getReviews(q, currentPage);
  
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '16px' }} className="home-title">Khám Phá Phim Mới Nhất</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px auto' }} className="home-desc">
          Đọc các bài review phim chân thực, sắc sảo và nhận ngay mã bí mật để lấy ưu đãi mua sắm trên Shopee.
        </p>
        
        <SearchBar />
      </div>

      {reviews.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Không tìm thấy kết quả nào.</p>
      ) : (
        <>
          <div className="grid">
            {reviews.map((review: any) => (
              <Link href={`/${review.slug}`} key={review.slug}>
                <div className="card glass">
                  <img src={review.thumbnail} alt={review.title} className="card-image" loading="lazy" />
                  <div className="card-content">
                    <h3 className="card-title">{review.title}</h3>
                    <p className="card-quote">"{review.quote}"</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>🗓 {new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                      <span>👁 {review.clicks || 0} lượt lấy mã</span>
                    </div>
                    <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                      Đọc ngay & nhận mã <span style={{ marginLeft: '4px' }}>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
              {currentPage > 1 ? (
                <Link href={`/?${q ? `q=${q}&` : ''}page=${currentPage - 1}`} className="btn" style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  ← Trang trước
                </Link>
              ) : (
                <span className="btn" style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'not-allowed', opacity: 0.5 }}>
                  ← Trang trước
                </span>
              )}
              
              <span style={{ fontWeight: 600 }}>
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link href={`/?${q ? `q=${q}&` : ''}page=${currentPage + 1}`} className="btn" style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  Trang sau →
                </Link>
              ) : (
                <span className="btn" style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'not-allowed', opacity: 0.5 }}>
                  Trang sau →
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
