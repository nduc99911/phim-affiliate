'use client';

import { useState } from 'react';

interface Props {
  slug: string;
}

export default function SecretCodeBlock({ slug }: Props) {
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [step, setStep] = useState(0); // 0: chưa lấy, 1: đang đếm ngược, 2: sẵn sàng
  const [countdown, setCountdown] = useState<number | null>(null);
  const [fetchedData, setFetchedData] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startCountdown = async () => {
    if (step !== 0) return;
    
    setStep(1);
    setCountdown(5);
    
    // Bắt đầu lấy dữ liệu ngầm
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setFetchedData(data);
      })
      .catch(() => console.error('Lỗi lấy mã'));

    // Đếm ngược 5 giây
    let timeLeft = 5;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        setStep(2); // Sẵn sàng
      }
    }, 1000);
  };

  const handleReveal = () => {
    if (step === 0) {
      startCountdown();
    } else if (step === 2) {
      // Khi user bấm vào nút "Mã đã sẵn sàng" -> Hành động đồng bộ -> Trình duyệt không chặn Popup
      if (fetchedData && fetchedData.secretCode) {
        setRevealedCode(fetchedData.secretCode);
        showToast('Đã lấy mã thành công!', 'success');
        
        // Auto-copy mã
        navigator.clipboard.writeText(fetchedData.secretCode).catch(() => {});
        
        // Mở link Affiliate
        if (fetchedData.affiliateLink) {
          window.open(fetchedData.affiliateLink, '_blank');
        }
      } else {
        showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        setStep(0);
      }
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
                disabled={step === 1}
                style={{ 
                  fontSize: '18px', 
                  padding: '16px 40px', 
                  width: '100%', 
                  maxWidth: '350px',
                  background: step === 2 ? 'var(--success)' : 'var(--accent)',
                  animation: step === 2 ? 'pulse 1s infinite' : 'none'
                }}
              >
                {step === 0 && 'Lấy Mã Ngay'}
                {step === 1 && `Đang giải mã... Vui lòng đợi ${countdown}s`}
                {step === 2 && 'Mã đã sẵn sàng! Mở Shopee Ngay 👉'}
              </button>
              
              {step === 1 && (
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
