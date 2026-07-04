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

  const categories = ['Y tá', 'Học sinh', 'Cô giáo', 'Vợ người ta', 'Thư ký', 'Chị gái', 'Mẹ kế', 'Vụng trộm'];

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
      
      {/* Category Chips */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        paddingBottom: '8px',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none'  // IE/Edge
      }}
      className="hide-scrollbar"
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: query === cat ? '1px solid var(--accent)' : '1px solid var(--card-border)',
              background: query === cat ? 'rgba(255, 74, 90, 0.1)' : 'var(--card-bg)',
              color: query === cat ? 'var(--accent)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
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
