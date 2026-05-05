import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Lock,
  FileText,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useStore();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Boshqaruv Paneli', roles: ['admin'] },
    { id: 'pos', icon: ShoppingCart, label: 'Kassa (POS)', roles: ['admin', 'cashier'] },
    { id: 'inventory', icon: Package, label: 'Ombor & Tovarlar', roles: ['admin'] },
    { id: 'customers', icon: Users, label: 'Savdo Tahliliyoti', roles: ['admin'] },
    { id: 'archive', icon: FileText, label: 'Hujjatlar Arshivi', roles: ['admin'] },
    { id: 'analytics', icon: BarChart3, label: 'Business Intelligence', roles: ['admin'] },
    { id: 'settings', icon: Settings, label: 'Tizim Sozlamalari', roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role || 'admin'));

  return (
    <aside className="sidebar">
      {/* Premium Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '4rem', padding: '0 0.5rem' }}>
        <div className="stat-icon-wrapper" style={{ 
          width: '52px', 
          height: '52px', 
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, #b8860b 100%)', 
          borderRadius: '16px',
          marginBottom: '0',
          boxShadow: '0 10px 25px rgba(226, 183, 74, 0.3)',
          border: 'none'
        }}>
          <Zap color="#050a0f" size={26} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1', color: '#fff' }}>
            TIJORAT<span className="text-gold" style={{ fontSize: '1.6rem' }}>PRO</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
             <div className="ai-status-pulse" style={{ width: '6px', height: '6px' }}></div>
             <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2.5px' }}>Enterprise AI</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', paddingLeft: '1.5rem' }}>Asosiy Menyusi</div>
        {visibleItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                padding: '1.1rem 1.5rem',
                borderRadius: '18px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--accent-gold)' : 'inherit' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={16} className="fadeIn" style={{ color: 'var(--accent-gold)', opacity: 0.5 }} />}
            </div>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div 
          className="nav-item" 
          style={{ 
            color: 'var(--accent-purple)', 
            background: 'rgba(139, 92, 246, 0.05)', 
            border: '1px solid rgba(139, 92, 246, 0.1)',
            borderRadius: '16px'
          }}
          onClick={() => {
            if (window.lockScreen) window.lockScreen();
          }}
        >
          <Lock size={20} />
          <span>Ekranni Qulflash</span>
        </div>
        
        <div 
          className="nav-item" 
          style={{ 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.03)', 
            border: '1px solid rgba(239, 68, 68, 0.08)',
            borderRadius: '16px'
          }}
          onClick={() => window.location.reload()}
        >
          <LogOut size={20} />
          <span>Chiqish</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
