'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Settings, Link as LinkIcon, Link2,
  Trash2, Edit, Save, Plus, Database, MousePointerClick,
  CheckCircle, XCircle, LayoutDashboard, Globe
} from 'lucide-react';
import s from './admin.module.css';

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ title: '', thumbnail: '', quote: '', content: '', secretCode: '', affiliateLink: '' });
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

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
  const fetchReviews = async () => { setLoading(true); const r = await fetch('/api/reviews'); setReviews(await r.json()); setLoading(false); };
  const fetchStats = async () => { try { const r = await fetch('/api/stats'); if (r.ok) setStats(await r.json()); } catch {} };
  const fetchSettings = async () => { try { const r = await fetch('/api/settings?key=popunder_link'); if (r.ok) { const d = await r.json(); setPopunderLink(d.value || ''); } } catch {} };

  const savePopunderLink = async () => {
    setSavingSettings(true);
    try { const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'popunder_link', value: popunderLink }) }); r.ok ? showToast('Đã lưu cấu hình', 'success') : showToast('Lỗi lưu', 'error'); }
    catch { showToast('Lỗi hệ thống', 'error'); }
    finally { setSavingSettings(false); }
  };

  useEffect(() => { fetchReviews(); fetchStats(); fetchSettings(); }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault(); if (!importUrl) return; setImporting(true);
    try { const r = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: importUrl }) }); const d = await r.json();
      if (r.ok && d.success) { setFormData({ ...formData, ...d.data, affiliateLink: defaultShopeeLink }); setImportUrl(''); showToast('Trích xuất thành công!', 'success'); document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' }); }
      else showToast(d.error || 'Lỗi', 'error');
    } catch { showToast('Lỗi hệ thống', 'error'); } finally { setImporting(false); }
  };

  const handleBulkExtract = async (e: React.FormEvent) => {
    e.preventDefault(); if (!bulkUrl || bulkLimit <= 0) return; setIsBulking(true); setBulkStatus('Đang tìm link phim...');
    try {
      const rl = await fetch('/api/extract-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: bulkUrl }) }); const dl = await rl.json();
      if (!rl.ok || !dl.success) throw new Error(dl.error || 'Không thể lấy link');
      const links = dl.links.slice(0, bulkLimit); if (!links.length) throw new Error('Không tìm thấy link.');
      setBulkStatus(`Tìm thấy ${links.length} phim. Bắt đầu...`);
      let ok = 0, skip = 0;
      for (let i = 0; i < links.length; i++) {
        setBulkStatus(`Xử lý ${i + 1}/${links.length}...`);
        try { const re = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: links[i] }) }); const de = await re.json();
          if (re.ok && de.success) { const rp = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...de.data, affiliateLink: defaultShopeeLink }) }); rp.ok ? ok++ : skip++; } else skip++;
        } catch { skip++; }
      }
      setBulkStatus(''); showToast(`Xong! Thêm ${ok}, bỏ qua ${skip}.`, 'success'); fetchReviews();
    } catch (err: any) { setBulkStatus(''); showToast(err.message, 'error'); } finally { setIsBulking(false); }
  };

  const handleDelete = async (slug: string) => { if (!confirm('Xóa phim này?')) return; await fetch(`/api/reviews/${slug}`, { method: 'DELETE' }); if (editingSlug === slug) handleCancelEdit(); showToast('Đã xóa!', 'success'); fetchReviews(); };
  const handleEdit = (r: any) => { setEditingSlug(r.slug); setFormData({ title: r.title, thumbnail: r.thumbnail, quote: r.quote, content: r.content, secretCode: r.secretCode, affiliateLink: r.affiliateLink }); document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' }); };
  const handleCancelEdit = () => { setEditingSlug(null); setFormData({ title: '', thumbnail: '', quote: '', content: '', secretCode: '', affiliateLink: '' }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlug) { const r = await fetch(`/api/reviews/${editingSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); r.ok ? showToast('Cập nhật OK!', 'success') : showToast('Lỗi cập nhật', 'error'); }
    else { const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); const d = await r.json(); r.ok ? showToast('Đã đăng!', 'success') : showToast(d.error || 'Lỗi', 'error'); }
    handleCancelEdit(); fetchReviews();
  };

  const statItems = [
    { label: 'Hôm Nay', val: stats.today, icon: <Globe size={16} />, bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)', glow: '#3b82f6' },
    { label: 'Trong Tuần', val: stats.week, icon: <BarChart3 size={16} />, bg: 'linear-gradient(135deg,#6366f1,#a855f7)', glow: '#6366f1' },
    { label: 'Trong Tháng', val: stats.month, icon: <BarChart3 size={16} />, bg: 'linear-gradient(135deg,#d946ef,#ec4899)', glow: '#d946ef' },
    { label: 'Cả Năm', val: stats.year, icon: <BarChart3 size={16} />, bg: 'linear-gradient(135deg,#64748b,#94a3b8)', glow: '#64748b' },
    { label: 'Tổng Click', val: stats.totalClicks, icon: <MousePointerClick size={16} />, bg: 'linear-gradient(135deg,#f43f5e,#ef4444)', glow: '#f43f5e', special: true },
  ];

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.logo}><LayoutDashboard size={22} color="#fff" /></div>
        <div><h1 className={s.title}>Bảng Điều Khiển</h1><p className={s.subtitle}>Quản lý kho nội dung Affiliate</p></div>
      </div>

      {/* Stats */}
      <div className={s.stats}>
        {statItems.map((si, i) => (
          <div key={i} className={`${s.stat} ${si.special ? s.statGlowBorder : ''}`}>
            <div className={s.statGlow} style={{ background: si.glow }} />
            <div className={s.statIcon} style={{ background: si.bg }}>{si.icon}</div>
            <p className={s.statLabel}>{si.label}</p>
            <p className={s.statVal}>{si.val}</p>
          </div>
        ))}
      </div>

      {/* Config + Scrapers */}
      <div className={s.cols}>
        <div className={s.card}>
          <div className={s.cardHead}><div className={s.cardIcon} style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}><Settings size={18} /></div><h3 className={s.cardTitle}>Cấu Hình Growth Hack</h3></div>
          <div className={s.field}><label className={s.fieldLabel}>Link Affiliate Mặc Định</label><div className={s.inpIcon}><Link2 /><input className={s.inp} value={defaultShopeeLink} onChange={e => setDefaultShopeeLink(e.target.value)} /></div></div>
          <div className={s.field}><label className={s.fieldLabel}>Mưa Cookie (Pop-under)</label><div className={s.inlineRow}><input className={s.inp} value={popunderLink} onChange={e => setPopunderLink(e.target.value)} placeholder="Để trống để tắt..." /><button className={`${s.btn} ${s.btnSave}`} onClick={savePopunderLink} disabled={savingSettings}><Save size={14} />{savingSettings ? '...' : 'Lưu'}</button></div></div>
        </div>
        <div className={s.rightStack}>
          <div className={s.card}>
            <div className={s.cardHead}><div className={s.cardIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}><LinkIcon size={18} /></div><h3 className={s.cardTitle}>Bóc Tách (1 Link)</h3></div>
            <form onSubmit={handleImport} className={s.inlineRow}><input className={s.inp} placeholder="Dán URL phim..." value={importUrl} onChange={e => setImportUrl(e.target.value)} /><button type="submit" className={`${s.btn} ${s.btnGreen}`} disabled={importing}>{importing ? 'Đang lấy...' : 'Bóc Tách'}</button></form>
          </div>
          <div className={s.card}>
            <div className={s.cardHead}><div className={s.cardIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}><Database size={18} /></div><h3 className={s.cardTitle}>Quét Hàng Loạt</h3></div>
            <form onSubmit={handleBulkExtract}>
              <div className={s.bulkRow}><input className={s.inp} placeholder="URL danh mục..." value={bulkUrl} onChange={e => setBulkUrl(e.target.value)} required /><div className={s.bulkNum}><span>SL:</span><input type="number" className={s.inp} value={bulkLimit} onChange={e => setBulkLimit(+e.target.value)} min={1} max={100} required /></div></div>
              <button type="submit" className={`${s.btn} ${s.btnBlue}`} disabled={isBulking}>{isBulking ? 'Đang quét...' : 'Bắt Đầu Quét & Thêm Phim'}</button>
              {bulkStatus && <div className={s.bulkStatus}><div className={s.spinner} />{bulkStatus}</div>}
            </form>
          </div>
        </div>
      </div>

      {/* Form */}
      <div id="edit-form" className={`${s.formSection} ${editingSlug ? s.formEditing : ''}`}>
        <div className={s.cardHead}><div className={s.cardIcon} style={{ background: editingSlug ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.04)', color: editingSlug ? '#fb7185' : '#94a3b8' }}>{editingSlug ? <Edit size={18} /> : <Plus size={18} />}</div><h3 className={s.cardTitle}>{editingSlug ? 'Chỉnh Sửa Bài Viết' : 'Thêm Phim Mới'}</h3></div>
        <form onSubmit={handleSubmit} className={s.formGrid}>
          <div><label className={s.fieldLabel}>Tên phim</label><input className={s.inp} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
          <div><label className={s.fieldLabel}>Ảnh bìa (URL)</label><input className={s.inp} value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} required /></div>
          <div className={s.formFull}><label className={s.fieldLabel}>Trích dẫn</label><input className={s.inp} value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })} required /></div>
          <div className={s.formFull}><label className={s.fieldLabel}>Nội dung chi tiết</label><textarea className={`${s.inp} ${s.textarea}`} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required /></div>
          <div><label className={s.fieldLabel}>Mã xem phim</label><input className={s.inp} value={formData.secretCode} onChange={e => setFormData({ ...formData, secretCode: e.target.value })} required /></div>
          <div><label className={s.fieldLabel}>Link Affiliate</label><input className={s.inp} value={formData.affiliateLink} onChange={e => setFormData({ ...formData, affiliateLink: e.target.value })} required /></div>
          <div className={s.formActions}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`}><Save size={16} />{editingSlug ? 'Cập Nhật' : 'Đăng Bài'}</button>
            {editingSlug && <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={handleCancelEdit}>Hủy</button>}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className={s.tableWrap}>
        <div className={s.tableHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className={s.cardIcon} style={{ background: '#1e293b', color: '#94a3b8' }}><Database size={18} /></div><h3 className={s.cardTitle}>Kho Phim Đã Đăng</h3></div>
          <span className={s.badge}>{reviews.length} phim</span>
        </div>
        {loading ? <div className={s.loading}><div className={s.loadSpin} /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>Phim</th><th style={{ textAlign: 'center', width: 120 }}>Mã Video</th><th style={{ textAlign: 'center', width: 80 }}>Click</th><th style={{ textAlign: 'right', width: 100 }}>Thao Tác</th></tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.slug} className={editingSlug === r.slug ? s.editingRow : undefined}>
                    <td><p className={s.filmTitle}>{r.title}</p><p className={s.filmQuote}>{r.quote}</p></td>
                    <td style={{ textAlign: 'center' }}><span className={s.codeBadge}>{r.secretCode}</span></td>
                    <td style={{ textAlign: 'center' }}><span className={s.clickBadge}>{r.clicks || 0}</span></td>
                    <td><div className={s.actionBtns}><button className={s.actionBtn} onClick={() => handleEdit(r)} title="Sửa"><Edit size={15} /></button><button className={`${s.actionBtn} ${s.actionBtnDel}`} onClick={() => handleDelete(r.slug)} title="Xóa"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}
                {!reviews.length && <tr><td colSpan={4} className={s.empty}>Chưa có phim nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div className={`${s.toast} ${toast.type === 'success' ? s.toastSuccess : s.toastError}`}>{toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}{toast.message}</div>}
    </div>
  );
}
