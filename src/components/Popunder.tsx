'use client';

import { useEffect } from 'react';

export default function Popunder() {
  useEffect(() => {
    // Không chạy ở trang admin
    if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;

    // Chỉ popunder 1 lần cho mỗi session/user
    const hasPopped = localStorage.getItem('has_popped');
    if (hasPopped) return;

    const enablePopunder = async () => {
      try {
        const res = await fetch('/api/settings?key=popunder_link');
        if (!res.ok) return;
        const data = await res.json();
        const link = data.value;
        
        if (!link || link.trim() === '') return;

        const triggerPopunder = (e: MouseEvent | TouchEvent) => {
          // Bỏ qua nếu click vào thẻ A, BUTTON, INPUT để tránh hỏng chức năng chính
          const target = e.target as HTMLElement;
          if (target.tagName === 'A' || target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
          
          window.open(link, '_blank');
          localStorage.setItem('has_popped', 'true');
          
          // Sau khi nổ popunder thì dọn dẹp sự kiện
          document.removeEventListener('click', triggerPopunder);
          document.removeEventListener('touchstart', triggerPopunder);
        };

        // Gắn sự kiện click vào toàn bộ trang
        document.addEventListener('click', triggerPopunder);
        document.addEventListener('touchstart', triggerPopunder);
      } catch (err) {
        console.error('Lỗi khởi tạo Mưa Cookie');
      }
    };

    enablePopunder();
  }, []);

  return null;
}
