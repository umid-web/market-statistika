import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Receipt, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

import { API_BASE_URL } from '../api';

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

  const filteredSalesHistory = React.useMemo(() => {
    return salesHistory.filter(s => {
      if (filterType === 'today') return isToday(s.order_date);
      if (filterType === 'week') return isThisWeek(s.order_date);
      if (filterType === 'month') return isThisMonth(s.order_date);
      if (filterType === 'year') return isThisYear(s.order_date);
      return true;
    });
  }, [salesHistory, filterType]);

  const groupedProducts = React.useMemo(() => {
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

  const dailyReceipts = salesHistory.filter(r => isToday(r.order_date));
  const monthlyReceipts = salesHistory.filter(r => isThisMonth(r.order_date));
  const yearlyReceipts = salesHistory.filter(r => isThisYear(r.order_date));

  const dailyTotal = dailyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);
  const monthlyTotal = monthlyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);
  const yearlyTotal = yearlyReceipts.reduce((sum, r) => sum + (Number(r.sell_price)*Number(r.quantity)), 0);

  // Get unique order_ids
  const dailyCount = new Set(dailyReceipts.map(r => r.order_id)).size;
  const monthlyCount = new Set(monthlyReceipts.map(r => r.order_id)).size;
  const yearlyCount = new Set(yearlyReceipts.map(r => r.order_id)).size;

  return (
    <div className="crm-module fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-emerald)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Financial Intelligence</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Savdo Hisobotlari</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sotilgan mahsulotlar va tushumlar bo'yicha batafsil tahliliy ma'lumotlar.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Bugungi Savdo</span>
            <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '0' }}>
              <Receipt size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <h3 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            {dailyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>UZS</small>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '800', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
            {dailyCount} ta chek yopildi
          </div>
        </div>

        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-gold)', padding: '2rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Oylik Savdo</span>
            <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'var(--accent-gold-soft)', borderRadius: '12px', marginBottom: '0' }}>
              <Calendar size={20} color="var(--accent-gold)" />
            </div>
          </div>
          <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            {monthlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>UZS</small>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: '800', background: 'var(--accent-gold-soft)', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
            {monthlyCount} ta tranzaksiya
          </div>
        </div>

        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-purple)', padding: '2rem', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Yillik Savdo</span>
            <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', marginBottom: '0' }}>
              <DollarSign size={20} color="var(--accent-purple)" />
            </div>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
            {yearlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>UZS</small>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: '800', background: 'rgba(139, 92, 246, 0.05)', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
            Jami {yearlyCount} ta chek
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Mahsulotlar Kesimida Savdo</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sotilgan mahsulotlarning umumiy hajmi va tushum miqdori</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
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
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: filterType === f.id ? 'var(--accent-gold)' : 'transparent',
                  color: filterType === f.id ? '#000' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
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
                <th>Mahsulot Nomi</th>
                <th>Kategoriya</th>
                <th>Sotuv Soni</th>
                <th>Umumiy Miqdor</th>
                <th>Jami Tushum</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>{p.name}</td>
                  <td>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      padding: '6px 12px', 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{p.times_sold} marta</td>
                  <td style={{ fontWeight: '800', fontSize: '1.25rem' }}>{p.total_quantity} <small style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>ta</small></td>
                  <td style={{ fontWeight: '900', color: 'var(--accent-emerald)', fontSize: '1.25rem' }}>
                    {p.total_amount.toLocaleString()} <small style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>UZS</small>
                  </td>
                </tr>
              ))}
              {groupedProducts.length === 0 && !loading && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>Hozircha ma'lumotlar mavjud emas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
