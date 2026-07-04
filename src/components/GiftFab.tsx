'use client';

export default function GiftFab() {
  return (
    <>
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        .fab-container {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .fab-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 30px;
          cursor: pointer;
          animation: heartbeat 2s infinite;
          text-decoration: none;
        }
        .fab-badge {
          background-color: var(--accent);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div className="fab-container">
        {typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin') && (
          <>
            <div className="fab-badge">Voucher 50K Bí Mật</div>
            <a href="https://shopee.vn/" target="_blank" rel="noopener noreferrer" className="fab-button">
              🎁
            </a>
          </>
        )}
      </div>
    </>
  );
}
