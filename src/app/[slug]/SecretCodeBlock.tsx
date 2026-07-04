'use client';

import { useState } from 'react';

interface Props {
  slug: string;
}

export default function SecretCodeBlock({ slug }: Props) {
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const executeReveal = async () => {
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
        
        // Gửi event GA
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'click_get_code', {
            'event_category': 'engagement',
            'event_label': slug,
          });
        }

        // Auto-copy mã (Nâng cấp)
        if (data.secretCode) {
          navigator.clipboard.writeText(data.secretCode).catch(() => {});
        }

        // Mở link affiliate trong tab mới
        if (data.affiliateLink) {
          window.open(data.affiliateLink, '_blank');
        }
      } else {
        showToast('Có lỗi xảy ra, không thể lấy mã!', 'error');
      }
    } catch (e) {
      console.error('Failed to get secret code', e);
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
      setCountdown(null);
    }
  };

  const handleReveal = () => {
    if (revealedCode || loading) return;
    
    setLoading(true);
    setCountdown(5);
    
    let timeLeft = 5;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        executeReveal();
      }
    }, 1000);
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
                {countdown !== null 
                  ? `Đang giải mã... Vui lòng đợi ${countdown}s` 
                  : 'Lấy Mã Ngay'}
              </button>
              
              {countdown !== null && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 60, 60, 0.1)',
                  border: '1px dashed var(--accent)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  animation: 'pulse 1s infinite'
                }}>
                  <style>{`
                    @keyframes pulse {
                      0% { opacity: 1; }
                      50% { opacity: 0.6; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                  ⏳ <strong>MẸO:</strong> Trong lúc chờ đợi, tranh thủ lụm ngay <strong style={{ color: 'var(--accent)' }}>Voucher Freeship 50k</strong> ở link bên dưới nhé!
                </div>
              )}
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
