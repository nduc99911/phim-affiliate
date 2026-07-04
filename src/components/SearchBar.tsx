'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  const categories = ['JAV', 'Phim hay', 'Phim Vietsub', 'Phim không che', 'Học sinh', 'Vụng trộm - Ngoại tình', 'Phim cấp 3', 'Mỹ - Châu Âu', 'XVIDEOS', 'XNXX', 'XXX'];

  const handleCategoryClick = (cat: string) => {
    setQuery(cat);
    router.push(`/?q=${encodeURIComponent(cat)}`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          className="input"
          placeholder="Tìm tên phim, diễn viên, thể loại (vd: Yui Hatano)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: 0, flexGrow: 1 }}
        />
        <button type="submit" className="btn" style={{ whiteSpace: 'nowrap' }}>
          Tìm Kiếm
        </button>
      </form>
      
      {/* Category Navigation */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px', 
        paddingBottom: '8px',
      }}>
        <button
          onClick={() => { setQuery(''); router.push('/'); }}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: 'none',
            background: query === '' ? 'var(--accent)' : '#2a2a2a',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          🏠 Trang chủ
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              background: query === cat ? 'var(--accent)' : '#2a2a2a',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
