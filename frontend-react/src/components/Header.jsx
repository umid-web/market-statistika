import React from 'react';
import { Bell, Search, UserCircle, Hexagon } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Header = ({ onRefresh }) => {
  const { user } = useStore();

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '3rem',
      animation: 'fadeIn 1s ease'
    }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.25rem' }}>
          Tizim Boshqaruvi
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
          <span>Xayrli kun, <strong style={{color: 'white'}}>{user.name}</strong>! Bugun savdolar yaxshi ketmoqda.</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button 
            className="glass-card" 
            onClick={() => {
              if (window.navigateTo) window.navigateTo('settings');
            }}
            style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={20} color="var(--text-secondary)" />
            <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #05080d' }}></span>
          </button>
        </div>

        <div 
          onClick={() => {
            if (window.navigateTo) window.navigateTo('settings');
          }}
          style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '0.5rem 1rem', 
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          cursor: 'pointer'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '600', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
          <div style={{ position: 'relative' }}>
            <Hexagon size={40} fill="rgba(212,175,55,0.1)" color="#d4af37" strokeWidth={1} />
            <UserCircle size={24} color="#d4af37" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
