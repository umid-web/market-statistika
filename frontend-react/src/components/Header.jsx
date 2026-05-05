import React from 'react';
import { Bell, Search, UserCircle, Hexagon, Sparkles, Command } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Header = ({ onRefresh }) => {
  const { user } = useStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Xayrli tong";
    if (hour < 18) return "Xayrli kun";
    return "Xayrli kech";
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '4rem',
      animation: 'fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            {getGreeting()}, <strong style={{color: '#fff'}}>{user.name}</strong>
          </span>
        </div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
          Platforma Markazi
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {/* Universal Command Bar Mockup */}
        <div style={{ 
          position: 'relative', 
          width: '320px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold-glow)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
        >
          <Command size={18} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Qidiruv...</span>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', border: '1px solid var(--glass-border)' }}>
            ⌘ K
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            className="glass-card" 
            onClick={() => {
              if (window.navigateTo) window.navigateTo('settings');
            }}
            style={{ padding: '0.85rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}
          >
            <Bell size={22} color="var(--text-secondary)" />
            <span style={{ position: 'absolute', top: '12px', right: '12px', width: '10px', height: '10px', background: 'var(--accent-gold)', borderRadius: '50%', border: '2px solid var(--bg-main)', boxShadow: '0 0 10px var(--accent-gold-glow)' }}></span>
          </button>
        </div>

        <div 
          onClick={() => {
            if (window.navigateTo) window.navigateTo('settings');
          }}
          style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem', 
          background: 'rgba(255,255,255,0.02)', 
          padding: '0.6rem 1.25rem', 
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{user.role}</div>
          </div>
          <div style={{ position: 'relative' }}>
            <Hexagon size={48} fill="rgba(226, 183, 74, 0.05)" color="var(--accent-gold)" strokeWidth={1} />
            <UserCircle size={28} color="var(--accent-gold)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
