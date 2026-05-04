import React, { useEffect } from 'react';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import Charts from '../components/Charts';
import DataTable from '../components/DataTable';
import { useStore } from '../context/StoreContext';
import { TrendingUp, Package, ShoppingCart, ArrowUpRight, ArrowDownRight, RefreshCcw, BrainCircuit, DollarSign, CalendarDays, CalendarRange, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { 
    products, 
    orders, 
    analytics, 
    fetchProducts, 
    fetchOrders, 
    fetchAnalytics,
    user
  } = useStore();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchAnalytics();
  }, []);

  // KPIs calculation
  const totalRevenue = (orders || []).reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = (orders || []).length;
  const totalProducts = (products || []).length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const kpis = [
    { title: "Jami Tushum", value: `${totalRevenue.toLocaleString()} so'm`, icon: DollarSign, trend: "+12.5%", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    { title: "Buyurtmalar", value: totalOrders.toLocaleString(), icon: ShoppingCart, trend: "+5.2%", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    { title: "Mahsulotlar", value: totalProducts.toLocaleString(), icon: Package, trend: "0.0%", color: "#d4af37", bg: "rgba(212, 175, 55, 0.1)" },
    { title: "O'rtacha Chek", value: `${Math.round(avgOrderValue).toLocaleString()} so'm`, icon: TrendingUp, trend: "+2.1%", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
  ];

  // Process data for charts
  const trendData = React.useMemo(() => {
    if (!analytics || analytics.length === 0) {
      // Demo Data for empty state
      return [
        { name: 'Yan', daromad: 400000 }, { name: 'Feb', daromad: 300000 },
        { name: 'Mar', daromad: 600000 }, { name: 'Apr', daromad: 800000 }
      ];
    }
    const monthly = {};
    analytics.forEach(item => {
      const m = item.order_month;
      monthly[m] = (monthly[m] || 0) + item.total_revenue;
    });
    return Object.entries(monthly).map(([name, daromad]) => ({ name, daromad }));
  }, [analytics]);

  const productData = React.useMemo(() => {
    if (!analytics || analytics.length === 0) {
      // Demo Data for empty state
      return [
        { name: 'Mahsulot A', value: 500000 }, { name: 'Mahsulot B', value: 300000 },
        { name: 'Mahsulot C', value: 200000 }
      ];
    }
    return analytics
      .sort((a, b) => b.total_profit - a.total_profit)
      .slice(0, 5)
      .map(item => ({ name: item.product_name, value: item.total_profit }));
  }, [analytics]);

  // Oylik o'sishni hisoblash (Growth Calculation)
  const { growthPercent, growthColor } = React.useMemo(() => {
    let percent = 0;
    let color = '#10b981';
    if (trendData.length >= 2) {
      const currentMonth = trendData[trendData.length - 1].daromad;
      const prevMonth = trendData[trendData.length - 2].daromad;
      if (prevMonth > 0) {
        percent = ((currentMonth - prevMonth) / prevMonth) * 100;
        color = percent >= 0 ? '#10b981' : '#ef4444';
      }
    }
    return { growthPercent: percent, growthColor: color };
  }, [trendData]);

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
        advices.push({ icon: '📈', text: `Biznes Tahlili: Savdolar o'sish tendentsiyasida. Mijozlar oqimi ijobiy.` });
      } else {
        advices.push({ icon: '⚠️', text: `Marketing Tavsiyasi: Savdolar tempi tushgan. Mijozlarga SMS aksiya yuborishni o'ylab ko'ring.` });
      }
    }
    if (advices.length === 0) advices.push({ icon: '✨', text: 'AI Tizim ma\'lumotlarni tahlil qilmoqda. Savdo qiling va natijalarni kuting.' });
    return advices;
  }, [products, productData, growthPercent, trendData]);

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
              lineHeight: '1.5'
            }}>
              {adv.icon} {adv.text}
            </div>
          ))}
        </div>
      </div>

      <StatsGrid kpis={kpis} />

      {/* Visual Analysis Section (Restored Recharts) */}
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
              {(products || []).reduce((acc, p) => acc + (Number(p.buy_price || 0) * Number(p.stock || 0)), 0).toLocaleString()} <small style={{fontSize: '0.8rem', color: '#666'}}>so'm</small>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <BrainCircuit size={16} /> AI Bashorati
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              +{Math.round(growthPercent > 0 ? totalRevenue * 1.15 : totalRevenue * 1.05).toLocaleString()} <small style={{fontSize: '0.8rem', color: '#666'}}>so'm</small>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginTop: '0.4rem' }}>Keyingi oy kutilayotgan tushum (bashorat)</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Oxirgi Tranzaksiyalar</h3>
          <button className="btn-premium btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => window.navigateTo('archive')}>Hammasini Ko'rish</button>
        </div>
        <DataTable data={(orders || []).slice(0, 5)} />
      </div>
    </div>
  );
};

export default Dashboard;
