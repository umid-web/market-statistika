import React, { useEffect, useState } from 'react';
import { 
  Database, Zap, FileSpreadsheet, RefreshCcw, Download, BrainCircuit, Package, TrendingUp, ArrowUpRight, BarChart3, Clock, Cpu
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { analytics, fetchAnalytics, addNotification, loading } = useStore();
  const [syncing, setSyncing] = useState(false);
  
  // Ma'lumotlarni xavfsiz yuklash
  const data = Array.isArray(analytics) ? analytics : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAnalytics();
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };
    loadData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await fetchAnalytics();
      addNotification("Spark tahlili yangilandi", "success");
    } catch (err) {
      addNotification("Sinxronizatsiya xatosi", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    if (data.length === 0) {
      addNotification("Eksport uchun ma'lumot yo'q", "error");
      return;
    }
    
    try {
      // xlsx kutubxonasini dinamik yuklash (build xatosini oldini olish uchun)
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
      XLSX.writeFile(workbook, "Enterprise_Analytics_Report.xlsx");
      addNotification("Excel hisoboti tayyor!", "success");
    } catch (err) {
      console.error("Export error:", err);
      addNotification("Eksportda xatolik yuz berdi", "error");
    }
  };

  const totalRevenue = data.reduce((acc, curr) => acc + (Number(curr.total_revenue) || 0), 0);
  const totalProfit = data.reduce((acc, curr) => acc + (Number(curr.total_profit) || 0), 0);
  const avgGrowth = data.length > 0 ? (data.reduce((acc, curr) => acc + (Number(curr.growth_percent) || 0), 0) / data.length).toFixed(1) : "0.0";

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '3rem' }}>
      {/* Premium Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Cpu size={20} className={syncing ? "animate-spin" : ""} />
            <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>Hadoop & Spark Engine</span>
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1px', color: 'white' }}>Enterprise Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Katta ma'lumotlar oqimini tahlil qilish va biznes prognozlari</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-premium btn-ghost" onClick={handleExport} style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
            <Download size={18} style={{ marginRight: '0.6rem' }} /> Export
          </button>
          <button className="btn-premium" onClick={handleSync} disabled={syncing || loading}>
            <RefreshCcw size={18} className={syncing || loading ? "animate-spin" : ""} style={{ marginRight: '0.6rem' }} />
            {syncing || loading ? "Processing..." : "Sync Spark"}
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '5px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.5rem' }}>Jami Tahlil Tushumi</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>{totalRevenue.toLocaleString()} <small style={{ fontSize: '0.8rem' }}>UZS</small></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '5px solid #d4af37', background: 'rgba(212, 175, 55, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.5rem' }}>O'rtacha O'sish</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#d4af37' }}>+{avgGrowth}%</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '5px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.5rem' }}>Sof Foyda (Tahlil)</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#8b5cf6' }}>{totalProfit.toLocaleString()} <small style={{ fontSize: '0.8rem' }}>UZS</small></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Visual Analysis */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={24} color="#d4af37" /> Savdo Ulushi va Mahsulotlar Tahlili
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.length > 0 ? data.slice(0, 8).map((item, idx) => (
              <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>Kategoriya: {item.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontWeight: '900', fontSize: '1.1rem' }}>{item.total_revenue.toLocaleString()} <small>UZS</small></div>
                    <div style={{ color: (Number(item.growth_percent) || 0) >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '800' }}>
                      {(Number(item.growth_percent) || 0) >= 0 ? '+' : ''}{item.growth_percent}%
                    </div>
                  </div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min((item.total_revenue / (totalRevenue || 1)) * 100, 100)}%`, 
                    background: 'linear-gradient(90deg, #d4af37, #f59e0b)',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
                  }}></div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <RefreshCcw size={48} className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p>Katta ma'lumotlar oqimi kutilmoqda...</p>
              </div>
            )}
          </div>
        </div>

        {/* Strategic AI Panel */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrainCircuit size={24} color="#8b5cf6" /> AI Strategik Tavsiyalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.length > 0 ? data.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>{item.product_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.6' }}>
                  {(Number(item.growth_percent) || 0) > 10 
                    ? "Ushbu mahsulot savdosi tez o'smoqda. Zaxirani 25% ga oshirish tavsiya etiladi." 
                    : "Sotuvlar barqaror. Marketing kampaniyasi orqali tushumni 15% ga oshirish imkoniyati mavjud."}
                </div>
              </div>
            )) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>AI hozirda ma'lumotlarni tahlil qilmoqda...</p>
            )}
          </div>
        </div>
      </div>

      {/* Full Data Table */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '900' }}>
            <FileSpreadsheet size={24} color="#d4af37" /> Spark Ishlov Bergan Jadvallar
          </h3>
          <span style={{ fontSize: '0.8rem', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
            JAMI: {data.length} QATOR
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Mahsulot</th>
                <th>Oy</th>
                <th>Kategoriya</th>
                <th>Sotuv</th>
                <th>Tushum</th>
                <th>O'sish</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="row-hover">
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: '800', color: '#fff' }}>{row.product_name}</td>
                  <td>{row.order_month}</td>
                  <td>{row.category}</td>
                  <td>{row.total_quantity}</td>
                  <td style={{ fontWeight: '900', color: '#10b981' }}>{Number(row.total_revenue || 0).toLocaleString()}</td>
                  <td style={{ color: (Number(row.growth_percent) || 0) >= 0 ? '#10b981' : '#ef4444', fontWeight: '900' }}>
                    {(Number(row.growth_percent) || 0) > 0 ? '+' : ''}{row.growth_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
