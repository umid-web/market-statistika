import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Lock,
  ShieldCheck,
  FileText
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useStore();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin'] },
    { id: 'pos', icon: ShoppingCart, label: 'Kassa (POS)', roles: ['admin', 'cashier'] },
    { id: 'inventory', icon: Package, label: 'Ombor & Tovarlar', roles: ['admin'] },
    { id: 'customers', icon: Users, label: 'CRM (Mijozlar)', roles: ['admin'] },
    { id: 'archive', icon: FileText, label: 'Hujjatlar', roles: ['admin'] },
    { id: 'analytics', icon: BarChart3, label: 'Tahlillar', roles: ['admin'] },
    { id: 'settings', icon: Settings, label: 'Sozlamalar', roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role || 'admin'));

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3.5rem', padding: '0 0.5rem' }}>
        <div className="stat-icon-wrapper" style={{ 
          width: '48px', 
          height: '48px', 
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, #b8860b 100%)', 
          borderRadius: '14px',
          marginBottom: '0',
          boxShadow: '0 8px 20px rgba(226, 183, 74, 0.3)'
        }}>
          <Package color="#050a0f" size={24} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1' }}>
            V-ERP <span className="text-gold" style={{ fontSize: '1.4rem' }}>PRO</span>
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>Enterprise</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexNavigation: 'column', gap: '0.4rem', flexDirection: 'column' }}>
        {visibleItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ padding: '0.9rem 1.25rem' }}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} color={activeTab === item.id ? 'var(--accent-gold)' : 'inherit'} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <div 
          className="nav-item" 
          style={{ color: 'var(--accent-purple)', cursor: 'pointer', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
          onClick={() => {
            if (window.lockScreen) window.lockScreen();
          }}
        >
          <Lock size={20} />
          <span>Ekranni Qulflash</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
