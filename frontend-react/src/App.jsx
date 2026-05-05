import React, { useState, lazy, Suspense } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

// Lazy load pages for better performance and smaller initial bundle size
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Admin from './pages/Admin';
import Documents from './pages/Documents';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Loading component for Suspense
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%', 
    width: '100%',
    color: '#d4af37'
  }}>
    <div className="animate-spin" style={{ 
      width: '40px', 
      height: '40px', 
      border: '3px solid rgba(212, 175, 55, 0.1)', 
      borderTop: '3px solid #d4af37', 
      borderRadius: '50%' 
    }}></div>
  </div>
);

const AppContent = () => {
  const [isAppLocked, setIsAppLocked] = useState(true);
  const [activeTabState, setActiveTabState] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    return path || 'dashboard';
  });

  const setActiveTab = (path) => {
    setActiveTabState(path);
    window.history.pushState(null, '', `/${path}`);
  };

  React.useEffect(() => {
    window.navigateTo = setActiveTab;
    window.lockScreen = () => setIsAppLocked(true);
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', `/${activeTabState}`);
    }
    const handlePopState = () => {
      setActiveTabState(window.location.pathname.replace('/', '') || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTabState]);

  const { notifications, settings, setUser, loading: storeLoading } = useStore();
  const [pinError, setPinError] = useState(false);

  const handleUnlock = (val) => {
    const inputVal = String(val).trim();
    if (!inputVal) return;
    
    // Use settings from store with fallbacks
    const adminPin = String(settings?.lock_pin || '1234').trim();
    const cashierPin = String(settings?.cashier_pin || '0000').trim();

    const isAdmin = inputVal === adminPin;
    const isCashier = inputVal === cashierPin;

    if (isAdmin) {
      setUser({ name: 'Admin', role: 'admin' });
      setIsAppLocked(false);
      setActiveTab('dashboard');
      setPinError(false);
    } else if (isCashier) {
      setUser({ name: 'Kassir', role: 'cashier' });
      setIsAppLocked(false);
      setActiveTab('pos');
      setPinError(false);
    } else {
      setPinError(true);
      const el = document.getElementById('lock-pass');
      if (el) {
        el.value = '';
        el.focus();
      }
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const renderContent = () => {
    switch (activeTabState) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'inventory': return <Admin />;
      case 'customers': return <Customers />;
      case 'archive': return <Documents />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (isAppLocked) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999999, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(226, 183, 74, 0.05) 0%, transparent 70%)' }}>
        <div className="animate-float" style={{ background: 'rgba(226, 183, 74, 0.05)', padding: '2.5rem', borderRadius: '35px', marginBottom: '3rem', border: '1px solid var(--accent-gold-glow)', boxShadow: '0 0 50px rgba(226, 183, 74, 0.1)' }}>
          <Lock size={80} color="var(--accent-gold)" strokeWidth={1.5} />
        </div>
        <h1 className="text-gold" style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '900', letterSpacing: '-3px' }}>TIJORATPRO</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem', fontSize: '1.2rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Security Access Control</p>
        
        <div className={`glass-card ${pinError ? 'shake' : ''}`} style={{ 
          padding: '3rem', 
          width: '450px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2rem', 
          borderRadius: '35px', 
          background: 'rgba(255,255,255,0.02)',
          border: pinError ? '2px solid #ef4444' : '1px solid var(--glass-border-bright)',
          transition: 'border-color 0.3s'
        }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: pinError ? '#ef4444' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', textAlign: 'center' }}>
              {pinError ? "NOTO'G'RI PIN KOD!" : "XAVFSIZLIK PIN KODINI KIRITING"}
            </label>
            <input 
              type="password" 
              placeholder="••••" 
              className="premium-input" 
              autoFocus
              style={{ 
                height: '75px', 
                textAlign: 'center', 
                fontSize: '2.5rem', 
                letterSpacing: '15px', 
                borderRadius: '22px', 
                border: 'none',
                background: 'rgba(255,255,255,0.05)'
              }} 
              id="lock-pass" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock(e.target.value);
                }
              }}
            />
          </div>
          <button className="btn-premium" style={{ height: '70px', borderRadius: '22px', fontSize: '1.1rem' }} onClick={() => {
            const val = document.getElementById('lock-pass').value;
            handleUnlock(val);
          }}>
            TIZIMGA KIRISH
          </button>
        </div>
        <div style={{ marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px' }}>
          &copy; 2024 TIJORATPRO CLOUD ERP . ALL RIGHTS RESERVED
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTabState} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      </main>

      {/* Notifications Portal */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="toast" style={{ 
            background: n.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            border: `1px solid ${n.type === 'error' ? '#ef4444' : '#10b981'}`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: `0 10px 40px ${n.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            borderLeft: `4px solid ${n.type === 'error' ? '#ffb3b3' : '#a7f3d0'}`
          }}>
            {n.type === 'error' ? <AlertCircle size={24} color="#ffb3b3" /> : <CheckCircle2 size={24} color="#a7f3d0" />}
            <span style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{n.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;

