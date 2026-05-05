import React, { useEffect } from 'react';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import Charts from '../components/Charts';
import DataTable from '../components/DataTable';
import { useStore } from '../context/StoreContext';
import { TrendingUp, Package, ShoppingCart, ArrowUpRight, ArrowDownRight, RefreshCcw, BrainCircuit, DollarSign, CalendarDays, CalendarRange, Calendar, Lock } from 'lucide-react';

const Dashboard = () => {
  const { 
    products, 
    salesHistory, 
    analytics, 
    fetchProducts, 
    fetchSalesHistory, 
    fetchAnalytics,
    loading,
    user
  } = useStore();

  const [timeFilter, setTimeFilter] = React.useState('all');

  useEffect(() => {
    fetchProducts();
    fetchSalesHistory();
    fetchAnalytics();
  }, []);

  // Filter sales history based on time period
  const filteredSales = React.useMemo(() => {
    if (!salesHistory) return [];
    if (timeFilter === 'all') return salesHistory;

    const now = new Date();
    return salesHistory.filter(order => {
      const orderDate = new Date(order.order_date);
      if (isNaN(orderDate.getTime())) return false;

      switch (timeFilter) {
        case 'day':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return orderDate >= oneWeekAgo;
        case 'month':
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        case 'year':
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [salesHistory, timeFilter]);

  // KPIs calculation
  const totalRevenue = React.useMemo(() => 
    filteredSales.reduce((acc, order) => acc + (Number(order.sell_price * order.quantity) || 0), 0)
  , [filteredSales]);

  const totalOrders = React.useMemo(() => 
    [...new Set(filteredSales.map(s => s.order_id))].length
  , [filteredSales]);

  const totalProducts = (products || []).length;

  const avgOrderValue = React.useMemo(() => 
    totalOrders > 0 ? totalRevenue / totalOrders : 0
  , [totalRevenue, totalOrders]);

  // Trend calculation
  const { revenueTrend, ordersTrend, productsTrend, avgCheckTrend } = React.useMemo(() => {
    if (!salesHistory || timeFilter === 'all') return { revenueTrend: '0.0%', ordersTrend: '0.0%', productsTrend: '0.0%', avgCheckTrend: '0.0%' };

    const now = new Date();
    let prevStart, prevEnd;

    switch (timeFilter) {
      case 'day':
        prevStart = new Date(now); prevStart.setDate(now.getDate() - 1); prevStart.setHours(0,0,0,0);
        prevEnd = new Date(now); prevEnd.setDate(now.getDate() - 1); prevEnd.setHours(23,59,59,999);
        break;
      case 'week':
        prevStart = new Date(now); prevStart.setDate(now.getDate() - 14);
        prevEnd = new Date(now); prevEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        return { revenueTrend: '0.0%', ordersTrend: '0.0%', productsTrend: '0.0%', avgCheckTrend: '0.0%' };
    }

    const prevSales = salesHistory.filter(s => {
      const d = new Date(s.order_date);
      return d >= prevStart && d <= prevEnd;
    });

    const prevRev = prevSales.reduce((acc, s) => acc + (Number(s.sell_price * s.quantity) || 0), 0);
    const prevOrd = [...new Set(prevSales.map(s => s.order_id))].length;
    const prevAvgCheck = prevOrd > 0 ? prevRev / prevOrd : 0;
    
    // Mahsulotlar trendi uchun: joriy davrda sotilgan unikal mahsulotlar sonini solishtiramiz
    const currentUniqueProds = [...new Set(filteredSales.map(s => s.product_id))].length;
    const prevUniqueProds = [...new Set(prevSales.map(s => s.product_id))].length;

    const calcPercent = (curr, prev) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0.0%';
      const p = ((curr - prev) / prev) * 100;
      if (p === 0) return '0.0%';
      return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
    };

    return {
      revenueTrend: calcPercent(totalRevenue, prevRev),
      ordersTrend: calcPercent(totalOrders, prevOrd),
      productsTrend: calcPercent(currentUniqueProds, prevUniqueProds),
      avgCheckTrend: calcPercent(avgOrderValue, prevAvgCheck)
    };
  }, [salesHistory, timeFilter, totalRevenue, totalOrders, avgOrderValue, filteredSales]);

  const periodLabels = {
    day: 'Bugungi',
    week: 'Haftalik',
    month: 'Oylik',
    year: 'Yillik',
    all: 'Jami'
  };

  const kpis = [
    { title: `${periodLabels[timeFilter]} Tushum`, value: `${totalRevenue.toLocaleString()}`, unit: "so'm", icon: DollarSign, trend: revenueTrend, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    { title: `${periodLabels[timeFilter]} Buyurtmalar`, value: totalOrders.toLocaleString(), unit: "ta", icon: ShoppingCart, trend: ordersTrend, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    { title: "Sotilgan Mahsulotlar", value: [...new Set(filteredSales.map(s => s.product_id))].length.toLocaleString(), unit: "tur", icon: Package, trend: productsTrend, color: "#d4af37", bg: "rgba(212, 175, 55, 0.1)" },
    { title: "O'rtacha Chek", value: `${Math.round(avgOrderValue).toLocaleString()}`, unit: "so'm", icon: TrendingUp, trend: avgCheckTrend, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
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
    
    // Har bir mahsulot bo'yicha umumiy foydani hisoblaymiz (Aggregation)
    const productMap = {};
    analytics.forEach(item => {
      const name = item.product_name;
      productMap[name] = (productMap[name] || 0) + (Number(item.total_profit) || 0);
    });

    return Object.entries(productMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [analytics]);

  // Filtrangan tahlillar (DataTable uchun)
  const filteredAnalytics = React.useMemo(() => {
    if (!analytics) return [];
    // Faqat joriy oydagi yoki oxirgi oydagi ma'lumotlarni ko'rsatamiz
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let result = analytics.filter(item => item.order_month === currentMonth);
    
    // Agar joriy oyda savdo bo'lmasa, hammasini ko'rsatamiz lekin tartiblangan holda
    if (result.length === 0) result = [...analytics];
    
    return result.sort((a, b) => b.total_profit - a.total_profit);
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
    <div className="dashboard-view fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse"></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Live System Active</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Business Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Xush kelibsiz, <strong style={{color: '#fff'}}>Admin</strong>. Tizim tahlillari muvaffaqiyatli yakunlandi.</p>
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
            onClick={() => {
              if (window.lockScreen) window.lockScreen();
            }}
          >
            <Lock size={18} />
            Qulflash
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'day', label: 'Kun' },
              { id: 'week', label: 'Hafta' },
              { id: 'month', label: 'Oy' },
              { id: 'year', label: 'Yil' },
              { id: 'all', label: 'Jami' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: timeFilter === f.id ? 'var(--accent-gold)' : 'transparent',
                  color: timeFilter === f.id ? '#000' : 'var(--text-secondary)',
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
          <button className="btn-premium btn-ghost" onClick={fetchAnalytics} style={{ padding: '0.8rem' }}>
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* AI Intelligence Section */}
      <div className="ai-advisor-container animate-float">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--accent-purple)', padding: '0.75rem', borderRadius: '14px', boxShadow: '0 0 20px var(--accent-purple-glow)' }}>
            <BrainCircuit size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>TijoratPro AI Intelligent Assistant</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Spark Big Data algoritmlari asosidagi real-vaqt tavsiyalari</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {aiAdvices.map((adv, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(5, 10, 15, 0.4)', 
              padding: '1.25rem', 
              borderRadius: '18px', 
              border: '1px solid var(--glass-border)',
              borderLeft: '4px solid var(--accent-purple)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ marginRight: '0.75rem' }}>{adv.icon}</span> {adv.text}
            </div>
          ))}
        </div>
      </div>

      <StatsGrid kpis={kpis} />

      {/* Visual Analytics Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <Charts trendData={trendData} countryData={productData} />
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Insights</h3>
            <TrendingUp size={20} color="var(--accent-gold)" />
          </div>
          
          <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Monthly Growth</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
              {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}% 
              {growthPercent >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Compared to previous month</div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(226, 183, 74, 0.03)', borderRadius: '20px', border: '1px solid rgba(226, 183, 74, 0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Inventory Value</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
              {(products || []).reduce((acc, p) => acc + (Number(p.buy_price || 0) * Number(p.stock || 0)), 0).toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500'}}>UZS</small>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.03)', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
              <BrainCircuit size={16} /> AI Forecast
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
              +{Math.round(growthPercent > 0 ? totalRevenue * 1.15 : totalRevenue * 1.05).toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500'}}>UZS</small>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Expected revenue for next period</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginTop: '2rem' }}>
        <DataTable data={filteredAnalytics} />
      </div>

      <div className="glass-card" style={{ marginTop: '3rem', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Oxirgi Tranzaksiyalar</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Tizimga kelib tushgan so'nggi savdo amaliyotlari</p>
          </div>
          <button className="btn-premium btn-ghost" style={{ fontSize: '0.8rem', padding: '0.7rem 1.5rem' }}>Hammasini Ko'rish</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>ID raqami</th>
                <th>Mijoz</th>
                <th>Sana</th>
                <th>Umumiy Summa</th>
              </tr>
            </thead>
            <tbody>
              {(salesHistory || []).slice(0, 5).map((sale, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '800', color: 'var(--accent-purple)' }}>{sale.order_id}</td>
                  <td style={{ fontWeight: '600', color: '#fff' }}>MEHMON</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(sale.order_date).toLocaleDateString('uz-UZ')}</td>
                  <td style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>{(sale.sell_price * sale.quantity).toLocaleString()} so'm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
