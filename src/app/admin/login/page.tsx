'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }} className="glass p-8">
      <h2 style={{ fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>Đăng Nhập Quản Trị</h2>
      {error && <p style={{ color: 'var(--accent)', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <label>Mật khẩu:</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Nhập mật khẩu..."
          required
        />
        <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px' }}>Đăng Nhập</button>
      </form>
    </div>
  );
}
