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

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
      <input
        type="text"
        className="input"
        placeholder="Tìm kiếm phim theo tên..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 0, flexGrow: 1 }}
      />
      <button type="submit" className="btn" style={{ whiteSpace: 'nowrap' }}>
        Tìm Kiếm
      </button>
    </form>
  );
}
