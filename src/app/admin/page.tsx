'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, Settings, Link as LinkIcon, Link2, 
  Trash2, Edit, Save, Plus, Database, MousePointerClick, CheckCircle, XCircle, ChevronRight, LayoutDashboard, Globe
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
    <div className="min-h-screen pb-16 pt-8 font-sans" style={{ maxWidth: '1200px', margin: '0 auto', color: '#e2e8f0' }}>
      
      {/* Header Section */}
      <header className="mb-12 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Bảng Điều Khiển</h1>
            <p className="text-sm text-slate-400 mt-1">Quản lý kho nội dung Affiliate và tối ưu hóa chuyển đổi</p>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-12">
        <StatCard title="Truy Cập Hôm Nay" value={stats.today} icon={<Globe />} color="from-blue-500 to-cyan-400" />
        <StatCard title="Trong Tuần" value={stats.week} icon={<BarChart3 />} color="from-indigo-500 to-purple-500" />
        <StatCard title="Trong Tháng" value={stats.month} icon={<BarChart3 />} color="from-fuchsia-500 to-pink-500" />
        <StatCard title="Cả Năm" value={stats.year} icon={<BarChart3 />} color="from-slate-500 to-slate-400" />
        <StatCard title="Tổng Click Mã" value={stats.totalClicks} icon={<MousePointerClick />} color="from-rose-500 to-red-500" glow />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-[#131825] border border-white/5 rounded-3xl p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Cấu Hình Growth Hack</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Link Affiliate Mặc Định</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    className="w-full bg-[#0b0f19] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-slate-600"
                    value={defaultShopeeLink} 
                    onChange={e => setDefaultShopeeLink(e.target.value)} 
                    placeholder="https://shopee.vn/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mưa Cookie (Pop-under)</label>
                <div className="flex gap-3">
                  <input 
                    className="flex-grow bg-[#0b0f19] border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-slate-600"
                    value={popunderLink} 
                    onChange={e => setPopunderLink(e.target.value)} 
                    placeholder="Link mở ngầm..."
                  />
                  <button 
                    onClick={savePopunderLink} 
                    disabled={savingSettings}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-5 font-medium text-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Scrapers */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#131825] border border-white/5 rounded-3xl p-7 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                 <LinkIcon className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-semibold text-white">Bóc Tách Dữ Liệu (1 Link)</h3>
             </div>
             <form onSubmit={handleImport} className="flex gap-3">
               <input 
                 className="flex-grow bg-[#0b0f19] border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600"
                 placeholder="Dán URL phim (MissAV, JavHDZ, VLXX)..." 
                 value={importUrl} 
                 onChange={e => setImportUrl(e.target.value)} 
               />
               <button type="submit" disabled={importing} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                 {importing ? 'Đang lấy...' : 'Bóc Tách'}
               </button>
             </form>
          </div>

          <div className="bg-[#131825] border border-white/5 rounded-3xl p-7 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quét Hàng Loạt Tự Động</h3>
            </div>
            <form onSubmit={handleBulkExtract} className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-3">
                <input 
                  className="flex-grow bg-[#0b0f19] border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                  placeholder="URL Danh mục/Trang chủ (VD: https://javhdz.ws/)" 
                  value={bulkUrl} 
                  onChange={e => setBulkUrl(e.target.value)} 
                  required
                />
                <div className="relative">
                  <input 
                    type="number"
                    className="w-24 bg-[#0b0f19] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    value={bulkLimit} 
                    onChange={e => setBulkLimit(Number(e.target.value))}
                    min="1" max="100"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">SL:</span>
                </div>
              </div>
              <button type="submit" disabled={isBulking} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                {isBulking ? (
                  <span className="animate-pulse">Đang Quét Dữ Liệu...</span>
                ) : 'Bắt Đầu Quét & Thêm Phim'}
              </button>
              {bulkStatus && (
                <div className="mt-1 text-xs text-indigo-300 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  {bulkStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <div id="edit-form" className={`bg-[#131825] border rounded-3xl p-8 mb-12 shadow-xl transition-all duration-500 ${editingSlug ? 'border-rose-500/30 shadow-rose-500/10' : 'border-white/5'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2 rounded-lg ${editingSlug ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-300'}`}>
            {editingSlug ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {editingSlug ? 'Chỉnh Sửa Bài Viết' : 'Thêm Phim Mới'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Tên phim" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
          <FormInput label="Ảnh bìa (URL)" value={formData.thumbnail} onChange={v => setFormData({...formData, thumbnail: v})} />
          
          <div className="md:col-span-2">
            <FormInput label="Trích dẫn (Quote ngắn)" value={formData.quote} onChange={v => setFormData({...formData, quote: v})} />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">Nội dung chi tiết</label>
            <textarea 
              className="w-full bg-[#0b0f19] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-all min-h-[140px]"
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              required 
            />
          </div>
          
          <FormInput label="Mã xem phim (Secret Code)" value={formData.secretCode} onChange={v => setFormData({...formData, secretCode: v})} />
          <FormInput label="Link Affiliate Nhận Code" value={formData.affiliateLink} onChange={v => setFormData({...formData, affiliateLink: v})} />
          
          <div className="md:col-span-2 flex gap-4 mt-4 pt-4 border-t border-white/5">
            <button type="submit" className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl px-8 py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 flex-grow">
              <Save className="w-4 h-4" />
              {editingSlug ? 'Cập Nhật Thay Đổi' : 'Đăng Bài Lên Web'}
            </button>
            {editingSlug && (
              <button type="button" onClick={handleCancelEdit} className="bg-transparent border border-slate-600 hover:bg-white/5 text-slate-300 rounded-xl px-6 py-3 font-medium text-sm transition-all">
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-[#131825] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Kho Phim Đã Đăng</h3>
          </div>
          <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">{reviews.length} phim</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-[#0b0f19]/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Phim</th>
                  <th className="p-5 font-semibold text-center w-32">Mã Video</th>
                  <th className="p-5 font-semibold text-center w-24">Click</th>
                  <th className="p-5 font-semibold text-right w-32">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {reviews.map(review => (
                  <tr key={review.slug} className={`hover:bg-white/[0.02] transition-colors ${editingSlug === review.slug ? 'bg-rose-500/5' : ''}`}>
                    <td className="p-5">
                      <div className="font-semibold text-white mb-1 line-clamp-1">{review.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{review.quote}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-block bg-slate-800 text-slate-300 border border-white/10 px-2.5 py-1 rounded-md text-xs font-mono tracking-wide">
                        {review.secretCode}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-xs">
                        {review.clicks || 0}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(review)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(review.slug)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-slate-500">
                      Chưa có phim nào trong cơ sở dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100' : 'bg-rose-900/90 border-rose-500/30 text-rose-100'} backdrop-blur-md z-50 animate-in slide-in-from-right-4 fade-in duration-300`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ title, value, icon, color, glow = false }: { title: string, value: number, icon: any, color: string, glow?: boolean }) {
  return (
    <div className={`bg-[#131825] border ${glow ? 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/5 shadow-xl'} rounded-3xl p-5 relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}>
          <div className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <h3 className="text-3xl font-black text-white ml-1">{value}</h3>
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      <input 
        className="w-full bg-[#0b0f19] border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-slate-600"
        value={value} 
        onChange={e => onChange(e.target.value)} 
        required 
      />
    </div>
  );
}
