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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
        <div style={{ 
          width: '45px', 
          height: '45px', 
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 15px rgba(212, 175, 55, 0.3)'
        }}>
          <Package color="black" size={24} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          V-ERP <small style={{ color: '#d4af37', fontSize: '0.6rem', verticalAlign: 'top' }}>PRO</small>
        </span>
      </div>

      <nav style={{ display: 'flex', flexNavigation: 'column', gap: '0.25rem', flexDirection: 'column' }}>
        {visibleItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <div 
          className="nav-item" 
          style={{ color: '#8b5cf6', cursor: 'pointer' }}
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
