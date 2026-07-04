'use client';

import { useState, useEffect } from 'react';

const NAMES = ['Tuấn***', 'Hải***', 'Minh***', 'Linh***', 'Hương***', 'Dũng***', 'Hùng***', 'Mai***', 'Hoàng***', 'Thành***'];
const ACTIONS = ['vừa lấy mã freeship thành công', 'vừa săn sale Shopee', 'vừa mở khóa mã bí mật', 'vừa lấy voucher 50k', 'đã lưu mã ưu đãi'];

export default function FomoNotification() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({ name: '', action: '', time: '' });

  useEffect(() => {
    // Không hiện ở trang admin
    if (window.location.pathname.startsWith('/admin')) return;

    const showRandomNotification = () => {
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const randomTime = Math.floor(Math.random() * 10) + 1; // 1 đến 10 phút trước
      
      setNotification({ name: randomName, action: randomAction, time: `${randomTime} phút trước` });
      setVisible(true);

      // Ẩn đi sau 4 giây
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    // Lần đầu hiện sau 5 giây
    const initialTimer = setTimeout(showRandomNotification, 5000);

    // Sau đó cứ ngẫu nhiên 15 - 30 giây hiện 1 lần
    const intervalTimer = setInterval(() => {
      setTimeout(showRandomNotification, Math.random() * 15000);
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--accent)',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      animation: 'slideUp 0.5s ease-out, fadeOut 0.5s ease-in 3.5s forwards',
      maxWidth: '300px'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '18px',
        flexShrink: 0
      }}>
        {notification.name.charAt(0)}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
          {notification.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {notification.action}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--accent)' }}>
          {notification.time}
        </p>
      </div>
    </div>
  );
}
