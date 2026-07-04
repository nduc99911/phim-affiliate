'use client';

import { useState } from 'react';

interface Props {
  slug: string;
}

export default function SecretCodeBlock({ slug }: Props) {
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReveal = async () => {
    if (revealedCode || loading) return;
    
    // Mở tab TRƯỚC KHI tải dữ liệu để tránh trình duyệt chặn Popup
    const newWindow = window.open('about:blank', '_blank');
    
    setLoading(true);
    try {
      const res = await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setRevealedCode(data.secretCode);
        showToast('Đã lấy mã thành công!', 'success');
        
        // Auto-copy mã
        if (data.secretCode) {
          navigator.clipboard.writeText(data.secretCode).catch(() => {});
        }

        // Chuyển hướng tab vừa mở sang Shopee
        if (newWindow && data.affiliateLink) {
          newWindow.location.href = data.affiliateLink;
        } else if (newWindow) {
          newWindow.close();
        }
      } else {
        if (newWindow) newWindow.close();
        showToast('Có lỗi xảy ra, không thể lấy mã!', 'error');
      }
    } catch (e) {
      if (newWindow) newWindow.close();
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (revealedCode) {
      navigator.clipboard.writeText(revealedCode);
      showToast('Đã copy mã vào khay nhớ tạm!', 'success');
    }
  };

  return (
    <>
      <div className="glass" style={{ padding: '30px', marginTop: '40px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Mã Bí Mật Của Phim Này</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Sử dụng mã này để nhận ưu đãi đặc biệt khi mua sắm trên Shopee.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div 
            className={`code-box ${revealedCode ? 'revealed' : ''}`}
            onClick={handleCopy}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '2px dashed var(--card-border)',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '4px',
              position: 'relative',
              overflow: 'hidden',
              color: revealedCode ? 'var(--success)' : 'transparent',
              textShadow: revealedCode ? 'none' : '0 0 16px rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            {revealedCode ? revealedCode : '**********'}
            {revealedCode && <span className="copy-badge">Ấn để Copy</span>}
          </div>
          
          {!revealedCode && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <button 
                className="btn" 
                onClick={handleReveal}
                disabled={loading}
                style={{ fontSize: '18px', padding: '16px 40px', width: '100%', maxWidth: '300px' }}
              >
                {loading ? 'Đang xử lý...' : 'Lấy Mã Ngay'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
