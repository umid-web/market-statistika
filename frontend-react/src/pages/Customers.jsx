import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Receipt, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

const Customers = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/sales-history');
        setSalesHistory(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
    <div className="crm-module" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#00f2ff', marginBottom: '0.5rem' }}>
            <Activity size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Savdo Tahlili</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>Sotilgan Maxsulotlar Hisoboti</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem' }}>Bugungi Savdo</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
              <Receipt size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
            {dailyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: '#666', fontWeight: '600'}}>so'm</small>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>Jami {dailyCount} ta chek</p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem' }}>Oylik Savdo</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#3b82f6' }}>
              <Calendar size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
            {monthlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: '#666', fontWeight: '600'}}>so'm</small>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600' }}>Jami {monthlyCount} ta chek</p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid #d4af37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem' }}>Yillik Savdo</span>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#d4af37' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
            {yearlyTotal.toLocaleString()} <small style={{fontSize: '0.9rem', color: '#666', fontWeight: '600'}}>so'm</small>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: '600' }}>Jami {yearlyCount} ta chek</p>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={20} color="#00f2ff" /> Tovar Bo'yicha Sotuvlar
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn-premium ${filterType === 'all' ? '' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setFilterType('all')}>Barchasi</button>
            <button className={`btn-premium ${filterType === 'today' ? '' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setFilterType('today')}>Bugun</button>
            <button className={`btn-premium ${filterType === 'week' ? '' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setFilterType('week')}>Hafta</button>
            <button className={`btn-premium ${filterType === 'month' ? '' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setFilterType('month')}>Oy</button>
            <button className={`btn-premium ${filterType === 'year' ? '' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setFilterType('year')}>Yil</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Maxsulot Nomi</th>
                <th>Kategoriya</th>
                <th>Necha marta sotildi?</th>
                <th>Jami Sotilgan Miqdor</th>
                <th>Umumiy Tushum</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '800', color: '#00f2ff', fontSize: '0.95rem' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td style={{ fontWeight: '700' }}>{p.times_sold} marta</td>
                  <td style={{ fontWeight: '800', fontSize: '1.1rem' }}>{p.total_quantity}</td>
                  <td style={{ fontWeight: '800', color: 'white', fontSize: '1.1rem' }}>
                    {p.total_amount.toLocaleString()} <small style={{fontSize: '0.75rem'}}>so'm</small>
                  </td>
                </tr>
              ))}
              {groupedProducts.length === 0 && !loading && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Hozircha sotuvlar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
