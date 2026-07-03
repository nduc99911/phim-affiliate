'use client';

import { useState, useEffect } from 'react';

export default function AgeGateModal() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const verified = localStorage.getItem('age_verified');
    if (!verified) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setShow(false);
    document.body.style.overflow = 'auto';
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  // Only render after mount to prevent hydration mismatch
  if (!mounted || !show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="glass" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid var(--accent)',
        boxShadow: '0 0 40px rgba(255, 74, 90, 0.2)'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255, 74, 90, 0.1)', 
          color: 'var(--accent)', 
          fontSize: '28px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 24px auto',
          border: '2px solid var(--accent)'
        }}>
          18+
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Cảnh Báo Nội Dung Người Lớn</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
          Trang web này chứa nội dung nhạy cảm chỉ dành cho người từ 18 tuổi trở lên. Bằng cách nhấn xác nhận, bạn cam kết mình đã đủ tuổi hợp pháp để xem nội dung này.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn" onClick={handleVerify} style={{ padding: '14px', fontSize: '16px', background: 'var(--accent)' }}>
            Tôi cam kết đã đủ 18 tuổi
          </button>
          <button className="btn" onClick={handleReject} style={{ padding: '14px', fontSize: '16px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
            Tôi chưa đủ tuổi (Thoát)
          </button>
        </div>
      </div>
    </div>
  );
}
