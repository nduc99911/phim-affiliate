'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, Settings, Link as LinkIcon, Link2, 
  Trash2, Edit, Save, Plus, Database, MousePointerClick, CheckCircle, XCircle 
} from 'lucide-react';

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

  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, year: 0, totalClicks: 0 });

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
      if (res.ok) showToast('Đã lưu cấu hình Mưa Cookie', 'success');
      else showToast('Lỗi lưu cấu hình', 'error');
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
        showToast('Trích xuất thành công! Hãy kiểm tra lại thông tin bên dưới.', 'success');
        window.scrollTo({ top: document.getElementById('edit-form')?.offsetTop || 0, behavior: 'smooth' });
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

      setBulkStatus(`Tìm thấy ${targetLinks.length} phim. Bắt đầu xử lý...`);

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
      showToast(`Hoàn tất! Đã thêm ${successCount} phim (Bỏ qua ${skipCount} lỗi).`, 'success');
      fetchReviews();
    } catch (err: any) {
      setBulkStatus('');
      showToast(`Lỗi: ${err.message}`, 'error');
    } finally {
      setIsBulking(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này khỏi hệ thống?')) {
      await fetch(`/api/reviews/${slug}`, { method: 'DELETE' });
      if (editingSlug === slug) handleCancelEdit();
      showToast('Đã xóa dữ liệu thành công!', 'success');
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
    window.scrollTo({ top: document.getElementById('edit-form')?.offsetTop || 0, behavior: 'smooth' });
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
      if (res.ok) showToast('Cập nhật dữ liệu thành công!', 'success');
      else showToast('Lỗi khi cập nhật', 'error');
    } else {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Đã đăng phim mới!', 'success');
      } else {
        showToast(data.error || 'Lỗi đăng phim', 'error');
      }
    }
    handleCancelEdit();
    fetchReviews();
  };

  return (
    <div className="min-h-screen py-10" style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
            <Settings className="w-10 h-10 text-red-500" />
            Dashboard Quản Trị
          </h2>
          <p className="text-gray-400 mt-2">Quản lý kho phim affiliate của bạn một cách dễ dàng.</p>
        </div>
      </header>

      {/* Thống Kê Truy Cập & Click */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">View Hôm Nay</p>
          <h3 className="text-3xl font-bold text-blue-400">{stats.today}</h3>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Tuần Này</p>
          <h3 className="text-3xl font-bold text-purple-400">{stats.week}</h3>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Tháng Này</p>
          <h3 className="text-3xl font-bold text-pink-400">{stats.month}</h3>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Năm Nay</p>
          <h3 className="text-3xl font-bold text-white">{stats.year}</h3>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group border-red-500/30">
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm text-gray-400 font-medium mb-1 flex items-center gap-1">
            <MousePointerClick className="w-4 h-4 text-red-400" /> Tổng Click Mã
          </p>
          <h3 className="text-3xl font-extrabold text-red-500">{stats.totalClicks}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Cài Đặt Affiliate */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-red-400" />
            Cấu Hình Affiliate & Growth
          </h3>
          
          <div className="space-y-5 flex-grow">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Link Shopee Mặc Định (Thêm tự động)</label>
              <input 
                className="input w-full" 
                value={defaultShopeeLink} 
                onChange={e => setDefaultShopeeLink(e.target.value)} 
                placeholder="https://shopee.vn/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Mưa Cookie (Mở Pop-under ngầm)</label>
              <div className="flex gap-3">
                <input 
                  className="input flex-grow" 
                  value={popunderLink} 
                  onChange={e => setPopunderLink(e.target.value)} 
                  placeholder="Để trống để tắt tính năng này..."
                />
                <button 
                  className="btn whitespace-nowrap !mb-[16px] flex items-center gap-2" 
                  onClick={savePopunderLink} 
                  disabled={savingSettings}
                >
                  <Save className="w-4 h-4" />
                  {savingSettings ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scraper / Auto Add */}
        <div className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl relative overflow-hidden">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
               <LinkIcon className="w-5 h-5" /> Trích Xuất Phim (1 Link)
             </h3>
             <form onSubmit={handleImport} className="flex gap-3">
               <input 
                 className="input flex-grow !mb-0" 
                 placeholder="Dán URL (MissAV/JavHDZ/VLXX)..." 
                 value={importUrl} 
                 onChange={e => setImportUrl(e.target.value)} 
               />
               <button type="submit" className="btn !bg-green-500 hover:!bg-green-600 !mb-0 flex items-center gap-2 whitespace-nowrap" disabled={importing}>
                 {importing ? 'Đang cào...' : 'Bóc Tách'}
               </button>
             </form>
          </div>

          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Database className="w-5 h-5" /> Quét Hàng Loạt (Auto Cào)
            </h3>
            <form onSubmit={handleBulkExtract} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input 
                  className="input flex-grow !mb-0" 
                  placeholder="URL Danh mục (VD: https://javhdz.ws/)" 
                  value={bulkUrl} 
                  onChange={e => setBulkUrl(e.target.value)} 
                  required
                />
                <div className="relative">
                  <input 
                    type="number"
                    className="input w-24 !mb-0 pl-10" 
                    value={bulkLimit} 
                    onChange={e => setBulkLimit(Number(e.target.value))}
                    min="1" max="100"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">SL:</span>
                </div>
              </div>
              <button type="submit" className="btn !bg-blue-600 hover:!bg-blue-700 flex items-center justify-center gap-2" disabled={isBulking}>
                {isBulking ? (
                  <span className="animate-pulse">Đang Quét Hệ Thống...</span>
                ) : 'Bắt Đầu Quét Tự Động'}
              </button>
              {bulkStatus && (
                <div className="mt-2 text-sm text-blue-300 bg-blue-900/30 p-2 rounded flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 animate-spin" /> {bulkStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Form Sửa / Thêm Mới */}
      <div id="edit-form" className={`glass p-8 rounded-2xl mb-10 transition-all duration-300 border-2 ${editingSlug ? 'border-red-500/50 shadow-[0_0_20px_rgba(255,74,90,0.2)]' : 'border-transparent'}`}>
        <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${editingSlug ? 'text-red-400' : 'text-white'}`}>
          {editingSlug ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          {editingSlug ? 'Chỉnh Sửa Thông Tin Phim' : 'Đăng Phim Mới (Thủ công)'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="font-semibold text-gray-300">Tên phim</label>
            <input className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <label className="font-semibold text-gray-300">Ảnh bìa (URL Thumbnail)</label>
            <input className="input" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-300">Trích dẫn (Quote hiển thị ngoài card)</label>
            <input className="input" value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-300">Nội dung chi tiết (Mô tả, diễn viên...)</label>
            <textarea className="input min-h-[120px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
          </div>
          <div>
            <label className="font-semibold text-gray-300">Mã xem phim (Mã bí mật)</label>
            <input className="input" value={formData.secretCode} onChange={e => setFormData({...formData, secretCode: e.target.value})} required />
          </div>
          <div>
            <label className="font-semibold text-gray-300">Link Affiliate đích (Shopee, Lazada...)</label>
            <input className="input" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} required />
          </div>
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button type="submit" className="btn flex-grow text-lg py-3 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              {editingSlug ? 'Lưu Thay Đổi' : 'Đăng Bài Lên Web'}
            </button>
            {editingSlug && (
              <button type="button" onClick={handleCancelEdit} className="btn !bg-transparent border !border-gray-500 hover:!bg-gray-800 text-gray-300 px-6">
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          Kho Phim Đã Đăng ({reviews.length})
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Tên Phim / Quote</th>
                  <th className="p-4 font-medium w-32 text-center">Mã Video</th>
                  <th className="p-4 font-medium w-24 text-center">Click</th>
                  <th className="p-4 font-medium w-32 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.slug} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${editingSlug === review.slug ? 'bg-red-500/10' : ''}`}>
                    <td className="p-4">
                      <div className="font-semibold text-white line-clamp-1">{review.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">{review.quote}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-mono">{review.secretCode}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-green-400">
                      {review.clicks || 0}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.slug)}
                        className="p-2 bg-red-900/50 hover:bg-red-600 text-red-300 hover:text-white rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">Chưa có phim nào. Bắt đầu bằng cách dán URL bên trên nhé!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type} flex items-center gap-2`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
