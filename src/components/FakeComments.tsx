'use client';

import { useState, useEffect } from 'react';

const FAKE_USERS = ['Quốc Hưng', 'Hoàng Tử Mưa', 'Tuấn Anh', 'Thành Đạt', 'Minh Kha', 'Trần Long', 'Duy Nghĩa', 'Bảo Nam', 'Anh Tài', 'Hải Phong'];
const FAKE_COMMENTS = [
  'Phim này ngon thật ae ạ 🤤', 
  'Vừa lấy mã mua cái sạc dự phòng kaka', 
  'Xin info em nữ chính với ae ơi', 
  'Link chuẩn đấy, cảm ơn ad',
  'Tuyệt vời ông mặt trời',
  'Mượt đấy, xem không bị lag',
  'Vừa húp được cái voucher 50k thơm lây',
  'Diễn viên nuột quá',
  'Admin đăng thêm nhiều phim kiểu này nhé'
];
const AVATAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

export default function FakeComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    // Dùng string slug để tạo một "seed" đơn giản, giúp các comment của 1 bộ phim luôn cố định
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const numComments = Math.abs(hash % 4) + 3; // Tạo từ 3 đến 6 comment
    const generated = [];
    
    let currentHash = Math.abs(hash);
    for (let i = 0; i < numComments; i++) {
      const userIndex = currentHash % FAKE_USERS.length;
      const commentIndex = (currentHash + i * 7) % FAKE_COMMENTS.length;
      const colorIndex = (currentHash + i * 3) % AVATAR_COLORS.length;
      const timeAgo = (currentHash % 24) + i * 2; // 1 đến 48 giờ trước
      
      generated.push({
        id: i,
        name: FAKE_USERS[userIndex],
        text: FAKE_COMMENTS[commentIndex],
        color: AVATAR_COLORS[colorIndex],
        time: `${timeAgo} giờ trước`
      });
      currentHash = Math.floor(currentHash / 2) + 1;
    }
    
    setComments(generated);
  }, [slug]);

  if (comments.length === 0) return null;

  return (
    <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--card-border)' }}>
      <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>💬 Bình luận ({comments.length})</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: comment.color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              flexShrink: 0
            }}>
              {comment.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{comment.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{comment.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4b5563', flexShrink: 0 }}></div>
        <input 
          type="text" 
          placeholder="Viết bình luận của bạn..." 
          className="input allow-select" 
          style={{ marginBottom: 0, flexGrow: 1, backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        />
      </div>
    </div>
  );
}
