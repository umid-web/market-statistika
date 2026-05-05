import React, { useState, useMemo } from 'react';
import { Activity, Receipt, Calendar, DollarSign, ShoppingBag, TrendingUp, Users, PieChart, ArrowUpRight, ArrowDownRight, Layers, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Customers = () => {
  const { salesHistory, loading } = useStore();
  const [filterType, setFilterType] = useState('all');

  const now = new Date();
  const isToday = (dStr) => {
    const d = new Date(dStr);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isThisWeek = (dStr) => {
    const d = new Date(dStr);
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };
  const isThisMonth = (dStr) => {
    const d = new Date(dStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isThisYear = (dStr) => {
    const d = new Date(dStr);
    return d.getFullYear() === now.getFullYear();
  };

  const filteredSalesHistory = useMemo(() => {
    return (salesHistory || []).filter(s => {
      if (filterType === 'today') return isToday(s.order_date);
      if (filterType === 'week') return isThisWeek(s.order_date);
      if (filterType === 'month') return isThisMonth(s.order_date);
      if (filterType === 'year') return isThisYear(s.order_date);
      return true;
    });
  }, [salesHistory, filterType]);

  const groupedProducts = useMemo(() => {
    const map = {};
    filteredSalesHistory.forEach(s => {
      const name = s.product_name || "Noma'lum";
      if (!map[name]) {
        map[name] = { 
          name: name, 
          category: s.category || '-', 
          total_quantity: 0, 
          total_amount: 0, 
          times_sold: 0 
        };
      }
      map[name].total_quantity += Number(s.quantity);
      map[name].total_amount += (Number(s.sell_price) * Number(s.quantity));
      map[name].times_sold += 1;
    });
    return Object.values(map).sort((a,b) => b.total_quantity - a.total_quantity);
  }, [filteredSalesHistory]);

  const dailyReceipts = (salesHistory || []).filter(r => isToday(r.order_date));
  const monthlyReceipts = (salesHistory || []).filter(r => isThisMonth(r.order_date));
  const yearlyReceipts = (salesHistory || []).filter(r => isThisYear(r.order_date));

  const dailyTotal = dailyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);
  const monthlyTotal = monthlyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);
  const yearlyTotal = yearlyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);

  const dailyCount = new Set(dailyReceipts.map(r => r.order_id)).size;
  const monthlyCount = new Set(monthlyReceipts.map(r => r.order_id)).size;
  const yearlyCount = new Set(yearlyReceipts.map(r => r.order_id)).size;

  return (
    <div className="crm-view fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-emerald)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Financial Intelligence</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Sotuv Tahliliyoti</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sotilgan mahsulotlar va moliyaviy o'sish ko'rsatkichlari.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn-premium btn-ghost" 
            style={{ 
              height: '55px', 
              padding: '0 1.5rem', 
              borderColor: 'rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-purple)',
              gap: '0.5rem'
            }}
            onClick={() => window.lockScreen && window.lockScreen()}
          >
            <Lock size={18} />
            Qulflash
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '4rem' }}>
        <div className="glass-card animate-float" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-emerald)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><TrendingUp size={120} color="var(--accent-emerald)" /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Bugungi Tushum</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-emerald)', letterSpacing: '-1px' }}>{dailyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>UZS</small></h3>
            </div>
            <div className="stat-icon-wrapper" style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', marginBottom: '0', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Receipt size={24} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '800', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '10px' }}>
              {dailyCount} ta tranzaksiya
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={16} /> 12.5%
            </div>
          </div>
        </div>

        <div className="glass-card animate-float" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-gold)', position: 'relative', overflow: 'hidden', animationDelay: '0.1s' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><Calendar size={120} color="var(--accent-gold)" /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Oylik Ko'rsatkich</div>
              <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{monthlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>UZS</small></h3>
            </div>
            <div className="stat-icon-wrapper" style={{ width: '50px', height: '50px', background: 'var(--accent-gold-soft)', borderRadius: '16px', marginBottom: '0', border: '1px solid var(--accent-gold-glow)' }}>
              <PieChart size={24} color="var(--accent-gold)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '800', background: 'var(--accent-gold-soft)', padding: '6px 12px', borderRadius: '10px' }}>
              {monthlyCount} ta chek
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={16} /> 8.4%
            </div>
          </div>
        </div>

        <div className="glass-card animate-float" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-purple)', position: 'relative', overflow: 'hidden', animationDelay: '0.2s' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><Layers size={120} color="#8b5cf6" /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Yillik Jami</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>{yearlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>UZS</small></h3>
            </div>
            <div className="stat-icon-wrapper" style={{ width: '50px', height: '50px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px', marginBottom: '0', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <DollarSign size={24} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '800', background: 'rgba(139, 92, 246, 0.08)', padding: '6px 12px', borderRadius: '10px' }}>
              {yearlyCount} ta operatsiya
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={16} /> 24.1%
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Sotilgan Mahsulotlar Tahlili</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Operatsiyalar soni va umumiy hajm bo'yicha tahlil.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'today', label: 'Bugun' },
              { id: 'week', label: 'Hafta' },
              { id: 'month', label: 'Oy' },
              { id: 'year', label: 'Yil' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: filterType === f.id ? 'var(--accent-gold)' : 'transparent',
                  color: filterType === f.id ? '#000' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2.5rem' }}>Mahsulot Nomi</th>
                <th>Kategoriya</th>
                <th>Sotuv Soni</th>
                <th>Jami Miqdor</th>
                <th style={{ paddingRight: '2.5rem', textAlign: 'right' }}>Jami Tushum</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ paddingLeft: '2.5rem' }}>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{p.name}</div>
                  </td>
                  <td>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '6px 14px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      color: 'var(--accent-gold)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      <Activity size={16} color="var(--accent-gold)" /> {p.times_sold} tranzaksiya
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '900', fontSize: '1.4rem', color: '#fff' }}>{p.total_quantity} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500'}}>ta</small></div>
                  </td>
                  <td style={{ paddingRight: '2.5rem', textAlign: 'right' }}>
                    <div style={{ fontWeight: '900', color: 'var(--accent-emerald)', fontSize: '1.4rem' }}>
                      {p.total_amount.toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500'}}>UZS</small>
                    </div>
                  </td>
                </tr>
              ))}
              {groupedProducts.length === 0 && !loading && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '8rem', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '600' }}>Tanlangan davr uchun ma'lumotlar mavjud emas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
