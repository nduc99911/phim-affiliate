'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', thumbnail: '', quote: '', content: '', secretCode: '', affiliateLink: ''
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const [bulkUrl, setBulkUrl] = useState('https://vlxx.moi/');
  const [bulkLimit, setBulkLimit] = useState(5);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isBulking, setIsBulking] = useState(false);
  
  const [defaultShopeeLink, setDefaultShopeeLink] = useState('https://shopee.vn/');
  const [popunderLink, setPopunderLink] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, year: 0 });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings?key=popunder_link');
      if (res.ok) {
        const data = await res.json();
        setPopunderLink(data.value || '');
      }
    } catch (err) {
      console.error('Lỗi tải cài đặt');
    }
  };

  const savePopunderLink = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'popunder_link', value: popunderLink })
      });
      if (res.ok) showToast('Đã lưu Mưa Cookie', 'success');
      else showToast('Lỗi lưu cài đặt', 'error');
    } catch (err) {
      showToast('Lỗi hệ thống', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
    fetchSettings();
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setImporting(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData({
          ...formData,
          ...data.data,
          affiliateLink: defaultShopeeLink
        });
        setImportUrl('');
        showToast('Trích xuất thành công! Hãy kiểm tra lại và bấm Thêm.', 'success');
      } else {
        showToast(data.error || 'Lỗi trích xuất URL', 'error');
      }
    } catch (err) {
      showToast('Lỗi hệ thống', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleBulkExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkUrl || bulkLimit <= 0) return;
    setIsBulking(true);
    setBulkStatus('Đang tìm kiếm link phim...');

    try {
      const resLinks = await fetch('/api/extract-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: bulkUrl })
      });
      const dataLinks = await resLinks.json();

      if (!resLinks.ok || !dataLinks.success) {
        throw new Error(dataLinks.error || 'Không thể lấy link');
      }

      const targetLinks = dataLinks.links.slice(0, bulkLimit);
      if (targetLinks.length === 0) {
        throw new Error('Không tìm thấy link phim nào.');
      }

      setBulkStatus(`Tìm thấy ${targetLinks.length} phim. Bắt đầu quét...`);

      let successCount = 0;
      let skipCount = 0;
      for (let i = 0; i < targetLinks.length; i++) {
        setBulkStatus(`Đang xử lý phim ${i + 1}/${targetLinks.length}...`);
        try {
          const resExtract = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetLinks[i] })
          });
          const dataExtract = await resExtract.json();

          if (resExtract.ok && dataExtract.success) {
            const resPost = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...dataExtract.data,
                affiliateLink: defaultShopeeLink,
              }),
            });
            
            if (resPost.ok) {
              successCount++;
            } else {
              skipCount++;
            }
          } else {
            skipCount++;
          }
        } catch (err) {
          console.error('Lỗi khi quét:', targetLinks[i]);
        }
      }

      setBulkStatus('');
      showToast(`Hoàn tất! Đã thêm ${successCount} phim (Bỏ qua ${skipCount} phim trùng/lỗi).`, 'success');
      fetchReviews();
    } catch (err: any) {
      setBulkStatus('');
      showToast(`Lỗi: ${err.message}`, 'error');
    } finally {
      setIsBulking(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài review này?')) {
      await fetch(`/api/reviews/${slug}`, { method: 'DELETE' });
      if (editingSlug === slug) handleCancelEdit();
      showToast('Đã xóa bài review', 'success');
      fetchReviews();
    }
  };

  const handleEdit = (review: any) => {
    setEditingSlug(review.slug);
    setFormData({
      title: review.title,
      thumbnail: review.thumbnail,
      quote: review.quote,
      content: review.content,
      secretCode: review.secretCode,
      affiliateLink: review.affiliateLink
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
    setFormData({ title: '', thumbnail: '', quote: '', content: '', secretCode: '', affiliateLink: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlug) {
      const res = await fetch(`/api/reviews/${editingSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) showToast('Cập nhật thành công!', 'success');
      else showToast('Lỗi cập nhật', 'error');
    } else {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Thêm phim mới thành công!', 'success');
      } else {
        showToast(data.error || 'Lỗi thêm phim', 'error');
      }
    }
    handleCancelEdit();
    fetchReviews();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Quản Trị Bài Review</h2>

      {/* Thống Kê Truy Cập */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Hôm nay</p>
          <h3 style={{ fontSize: '28px', color: 'var(--success)' }}>{stats.today}</h3>
        </div>
        <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Tuần này</p>
          <h3 style={{ fontSize: '28px', color: '#3b82f6' }}>{stats.week}</h3>
        </div>
        <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Tháng này</p>
          <h3 style={{ fontSize: '28px', color: '#8b5cf6' }}>{stats.month}</h3>
        </div>
        <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Năm nay</p>
          <h3 style={{ fontSize: '28px', color: 'var(--accent)' }}>{stats.year}</h3>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Cài Đặt Hệ Thống</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ whiteSpace: 'nowrap', fontWeight: 'bold', minWidth: '200px' }}>Mặc Định Link Shopee:</label>
            <input 
              className="input" 
              style={{ marginBottom: 0, flexGrow: 1 }} 
              value={defaultShopeeLink} 
              onChange={e => setDefaultShopeeLink(e.target.value)} 
              placeholder="Nhập link Affiliate gốc vào đây (Sẽ tự động thêm khi Quét/Trích xuất)..."
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ whiteSpace: 'nowrap', fontWeight: 'bold', minWidth: '200px', color: 'var(--accent)' }}>Mưa Cookie (Pop-under):</label>
            <input 
              className="input" 
              style={{ marginBottom: 0, flexGrow: 1 }} 
              value={popunderLink} 
              onChange={e => setPopunderLink(e.target.value)} 
              placeholder="Nhập link Affiliate để chạy ngầm (Bỏ trống để tắt)..."
            />
            <button className="btn" onClick={savePopunderLink} disabled={savingSettings} style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}>
              {savingSettings ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--success)' }}>Nhập Nhanh 1 URL</h3>
          <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              className="input" 
              style={{ marginBottom: 0 }} 
              placeholder="Dán link 1 phim vào đây..." 
              value={importUrl} 
              onChange={e => setImportUrl(e.target.value)} 
            />
            <button type="submit" className="btn" disabled={importing} style={{ background: 'var(--success)' }}>
              {importing ? 'Đang trích xuất...' : 'Trích Xuất & Điền Form'}
            </button>
          </form>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#3b82f6' }}>Quét Tự Động Hàng Loạt</h3>
          <form onSubmit={handleBulkExtract} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input" 
                style={{ marginBottom: 0, flexGrow: 1 }} 
                placeholder="Trang đích (VD: https://vlxx.moi/jav/)" 
                value={bulkUrl} 
                onChange={e => setBulkUrl(e.target.value)} 
                required
              />
              <input 
                type="number"
                className="input" 
                style={{ marginBottom: 0, width: '80px' }} 
                placeholder="SL" 
                value={bulkLimit} 
                onChange={e => setBulkLimit(Number(e.target.value))}
                min="1" max="20"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={isBulking} style={{ background: '#3b82f6' }}>
              {isBulking ? 'Đang chạy quét...' : 'Quét & Thêm Tự Động'}
            </button>
            {bulkStatus && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{bulkStatus}</p>}
          </form>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', marginBottom: '40px', border: editingSlug ? '1px solid var(--accent)' : '1px solid transparent', transition: 'border-color 0.3s' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: editingSlug ? 'var(--accent)' : 'inherit' }}>
          {editingSlug ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới (Thủ công)'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label>Tên phim</label>
            <input className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <label>Ảnh bìa (URL)</label>
            <input className="input" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Trích dẫn (Quote)</label>
            <input className="input" value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Nội dung (Content)</label>
            <textarea className="input" style={{ minHeight: '120px' }} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
          </div>
          <div>
            <label>Mã bí mật</label>
            <input className="input" value={formData.secretCode} onChange={e => setFormData({...formData, secretCode: e.target.value})} required />
          </div>
          <div>
            <label>Link Affiliate Shopee</label>
            <input className="input" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn" style={{ flexGrow: 1 }}>
              {editingSlug ? 'Lưu Thay Đổi' : 'Thêm Bài Review'}
            </button>
            {editingSlug && (
              <button type="button" className="btn" onClick={handleCancelEdit} style={{ background: 'transparent', border: '1px solid var(--text-secondary)' }}>
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Danh Sách Phim</h3>
        {loading ? <p>Đang tải...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '12px' }}>Tên Phim</th>
                <th style={{ padding: '12px' }}>Lượt Click Mã</th>
                <th style={{ padding: '12px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.slug} style={{ borderBottom: '1px solid var(--card-border)', background: editingSlug === review.slug ? 'rgba(255, 74, 90, 0.1)' : 'transparent', transition: 'background 0.3s' }}>
                  <td style={{ padding: '12px' }}>{review.title}</td>
                  <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 600 }}>{review.clicks}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(review)}
                      style={{ background: 'var(--text-secondary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(review.slug)}
                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
