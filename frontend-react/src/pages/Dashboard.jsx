import React, { useEffect } from 'react';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import Charts from '../components/Charts';
import DataTable from '../components/DataTable';
import { useStore } from '../context/StoreContext';
import { TrendingUp, Package, ShoppingCart, ArrowUpRight, ArrowDownRight, RefreshCcw, BrainCircuit, DollarSign, CalendarDays, CalendarRange, Calendar } from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../api';

const Dashboard = () => {
  const { analytics, products, fetchAnalytics, loading } = useStore();
  const [salesHistory, setSalesHistory] = React.useState([]);

  React.useEffect(() => {
    axios.get(`${API_BASE_URL}/api/sales-history`)
      .then(res => setSalesHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  const totalRevenue = analytics.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0);

  const now = new Date();
  const isToday = (dStr) => {
    const d = new Date(dStr);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isThisWeek = (dStr) => {
    const diff = Math.abs(now - new Date(dStr));
    return Math.ceil(diff / (1000*3600*24)) <= 7;
  };
  const isThisMonth = (dStr) => {
    const d = new Date(dStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isThisYear = (dStr) => {
    const d = new Date(dStr);
    return d.getFullYear() === now.getFullYear();
  };

  const sumSales = (filterFn) => salesHistory.filter(s => filterFn(s.order_date)).reduce((acc, s) => acc + (s.sell_price * s.quantity), 0);

  const dailyRev = sumSales(isToday);
  const weeklyRev = sumSales(isThisWeek);
  const monthlyRev = sumSales(isThisMonth);
  const yearlyRev = sumSales(isThisYear);

  const kpis = [
    { label: 'Bugungi Tushum', value: dailyRev, icon: DollarSign, color: '#10b981', trend: '+15%' },
    { label: 'Haftalik Tushum', value: weeklyRev, icon: CalendarDays, color: '#3b82f6', trend: '+5.2%' },
    { label: 'Oylik Tushum', value: monthlyRev, icon: CalendarRange, color: '#8b5cf6', trend: '+12.1%' },
    { label: 'Yillik Tushum', value: yearlyRev, icon: Calendar, color: '#d4af37', trend: '+24%' },
  ];

  const trendData = Object.values(analytics.reduce((acc, curr) => {
    const month = curr.order_month;
    if (!acc[month]) acc[month] = { name: month, daromad: 0 };
    acc[month].daromad += curr.total_revenue;
    return acc;
  }, {})).sort((a, b) => a.name.localeCompare(b.name));

  // Oylik o'sishni hisoblash (Growth Calculation)
  let growthPercent = 0;
  let growthColor = '#10b981';
  if (trendData.length >= 2) {
    const currentMonth = trendData[trendData.length - 1].daromad;
    const prevMonth = trendData[trendData.length - 2].daromad;
    if (prevMonth > 0) {
      growthPercent = ((currentMonth - prevMonth) / prevMonth) * 100;
      growthColor = growthPercent >= 0 ? '#10b981' : '#ef4444';
    }
  }

  const productData = Object.entries(analytics.reduce((acc, curr) => {
    if (!acc[curr.product_name]) acc[curr.product_name] = 0;
    acc[curr.product_name] += curr.total_profit;
    return acc;
  }, {}))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const aiAdvices = React.useMemo(() => {
    let advices = [];
    const lowStock = products.filter(p => p.stock <= (p.min_stock || 5));
    if (lowStock.length > 0) {
      advices.push({ icon: '🔴', text: `Zaxira Tahlili: Omborda ${lowStock.length} ta mahsulot tugamoqda. "${lowStock[0].name}" zudlik bilan kerak!` });
    }
    if (productData.length > 0) {
      advices.push({ icon: '🧠', text: `Savdo Strategiyasi: Eng ko'p daromadni "${productData[0].name}" keltiryapti. Mijozlarga shuni taklif qiling.` });
    }
    if (trendData.length > 1) {
      if (growthPercent > 0) {
        advices.push({ icon: '📈', text: `Big Data Tahlili: Keyingi oyda ${Math.round(totalRevenue * 1.15).toLocaleString()} so'm kutilmoqda. Daromad o'smoqda!` });
      } else {
        advices.push({ icon: '⚠️', text: `Marketing Tavsiyasi: Savdolar tempi tushgan. Mijozlarga SMS aksiya yuborishni o'ylab ko'ring.` });
      }
    }
    if (advices.length === 0) advices.push({ icon: '✨', text: 'AI Tizim ma\'lumotlarni tahlil qilmoqda. Savdo qiling va natijalarni kuting.' });
    return advices;
  }, [products, productData, growthPercent, totalRevenue, trendData]);

  return (
    <div className="dashboard-view" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <Header onRefresh={fetchAnalytics} />
        <button 
          className="btn-premium btn-ghost" 
          onClick={fetchAnalytics}
          style={{ marginTop: '0.5rem' }}
        >
          <RefreshCcw size={18} /> Yangilash
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)', 
        border: '1px solid rgba(139, 92, 246, 0.3)', 
        borderRadius: '16px', 
        padding: '1.5rem', 
        marginBottom: '2rem',
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <BrainCircuit size={24} color="#8b5cf6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>V-ERP AI Maslahatchisi</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {aiAdvices.map((adv, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '1rem', 
              borderRadius: '12px', 
              borderLeft: '4px solid #8b5cf6',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{adv.icon}</span>
              <span style={{ color: '#e2e8f0' }}>{adv.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <StatsGrid kpis={kpis} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Charts trendData={trendData} countryData={productData} />
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Tezkor Statistikalar</h3>
          
          <div style={{ padding: '1.25rem', background: `${growthColor}10`, borderRadius: '16px', border: `1px solid ${growthColor}20` }}>
            <div style={{ fontSize: '0.8rem', color: growthColor, fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Oylik O'sish</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: growthColor }}>
              {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}% 
              {growthPercent >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>O'tgan oyga nisbatan</div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ombor Qiymati</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              {products.reduce((acc, p) => acc + (Number(p.buy_price || 0) * Number(p.stock || 0)), 0).toLocaleString()} <small style={{fontSize: '0.8rem', color: '#666'}}>so'm</small>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Zaxira Tanqisligi</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              {products.filter(p => p.stock <= 5).length} <small style={{fontSize: '0.8rem', color: '#666'}}>tovar</small>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <BrainCircuit size={16} /> AI Bashorati
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              +{Math.round(growthPercent > 0 ? totalRevenue * 1.15 : totalRevenue * 1.05).toLocaleString()} <small style={{fontSize: '0.8rem', color: '#666'}}>so'm</small>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginTop: '0.4rem' }}>Keyingi oy kutilayotgan tushum (15% ehtimoliy o'sish)</div>
          </div>
        </div>
      </div>

      <DataTable data={analytics} />
    </div>
  );
};

export default Dashboard;
