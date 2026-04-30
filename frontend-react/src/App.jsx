import React, { useState, lazy, Suspense } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

// Lazy load pages for better performance and smaller initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
const Admin = lazy(() => import('./pages/Admin'));
const Documents = lazy(() => import('./pages/Documents'));
const Customers = lazy(() => import('./pages/Customers'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

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

  const { notifications, settings, setUser } = useStore();
  const adminPin = String(settings?.lock_pin || '').trim();
  const cashierPin = String(settings?.cashier_pin || '').trim();

  const handleUnlock = (val) => {
    const inputVal = String(val).trim();
    if (!inputVal) return;
    
    const isAdmin = adminPin !== '' && inputVal === adminPin;
    const isCashier = !isAdmin && cashierPin !== '' && inputVal === cashierPin;
    if (isAdmin) {
      setUser({ name: 'Admin', role: 'admin' });
      setIsAppLocked(false);
      setActiveTab('dashboard');
    } else if (isCashier) {
      setUser({ name: 'Kassir', role: 'cashier' });
      setIsAppLocked(false);
      setActiveTab('pos');
    } else {
      alert("Noto'g'ri PIN kod!");
      const el = document.getElementById('lock-pass');
      if (el) el.value = '';
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
      <div style={{ position: 'fixed', inset: 0, background: '#05080d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)' }}>
          <Lock size={64} color="#d4af37" />
        </div>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '900', letterSpacing: '2px' }}>TIZIM QULFLANGAN</h1>
        <p style={{ color: '#888', marginBottom: '3rem' }}>Qulfdan chiqarish uchun xavfsizlik PIN kodini kiriting</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="password" 
            placeholder="****" 
            className="premium-input" 
            style={{ width: '200px', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px' }} 
            id="lock-pass" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUnlock(e.target.value);
              }
            }}
          />
          <button className="btn-premium" onClick={() => {
            const val = document.getElementById('lock-pass').value;
            handleUnlock(val);
          }}>
            Ochish
          </button>
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

