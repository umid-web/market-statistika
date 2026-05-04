import React, { useEffect, useState } from 'react';
import { 
  Database, Zap, FileSpreadsheet, RefreshCcw, Download, BrainCircuit, Package, TrendingUp, ArrowUpRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { analytics, fetchAnalytics, addNotification } = useStore();
  const [syncing, setSyncing] = useState(false);
  
  const data = Array.isArray(analytics) ? analytics : [];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await fetchAnalytics();
      addNotification("Spark tizimi yangilandi", "success");
    } catch (err) {
      addNotification("Sinxronizatsiya xatosi", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      addNotification("Eksport uchun ma'lumot yetarli emas", "error");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    XLSX.writeFile(workbook, "Hadoop_Spark_Report.xlsx");
    addNotification("Excel hisoboti tayyor!", "success");
  };

  const totalForecast = data.reduce((acc, curr) => acc + (curr.forecasted_revenue || 0), 0);
  const avgGrowth = data.length > 0 ? (data.reduce((acc, curr) => acc + (curr.growth_percent || 0), 0) / data.length).toFixed(1) : "0.0";

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Enterprise Big Data Pipeline</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }} className="text-gradient-gold">Hadoop Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Differentsial bashoratlar va real-vaqt ma'lumotlar oqimi</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-premium btn-ghost" onClick={handleExport}>
            <Download size={18} style={{ marginRight: '0.5rem' }} /> Export
          </button>
          <button className="btn-premium" onClick={handleSync} disabled={syncing}>
            <RefreshCcw size={18} className={syncing ? "animate-spin" : ""} style={{ marginRight: '0.5rem' }} />
            {syncing ? "Computing..." : "Sparkni Yangilash"}
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Oylik Bashorat</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{totalForecast.toLocaleString()} <small style={{ fontSize: '0.8rem' }}>UZS</small></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #d4af37' }}>
          <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>O'rtacha O'sish</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37' }}>+{avgGrowth}%</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Ishonchliligi</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6' }}>98.2%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Visual Prediction List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#d4af37" /> S(t) Bashorat Analizi
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.length > 0 ? data.slice(0, 6).map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '700' }}>{item.product_name}</div>
                  <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem' }}>{item.forecasted_revenue.toLocaleString()} UZS</div>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min((item.total_revenue / (item.forecasted_revenue || 1)) * 100, 100)}%`, 
                    background: 'linear-gradient(90deg, #d4af37, #10b981)'
                  }}></div>
                </div>
              </div>
            )) : <p style={{ color: '#666' }}>Ma'lumotlar yuklanmoqda...</p>}
          </div>
        </div>

        {/* AI Strategic Insights */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={20} color="#8b5cf6" /> AI Tavsiyalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.length > 0 ? data.slice(0, 4).map((item, idx) => (
              <div key={idx} style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '10px', borderLeft: '3px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>{item.product_name}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.25rem' }}>
                  {item.growth_percent > 5 ? "O'sish kutilmoqda. Zaxirani to'ldiring." : "Sotuvlar barqaror saqlanmoqda."}
                </div>
              </div>
            )) : <p style={{ color: '#666' }}>AI tahlil qilmoqda...</p>}
          </div>
        </div>
      </div>

      {/* Full Table */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Mahsulot</th>
              <th>Oy</th>
              <th>Tushum</th>
              <th>O'sish</th>
              <th style={{ color: '#d4af37' }}>Bashorat</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: '700' }}>{row.product_name}</td>
                <td>{row.order_month}</td>
                <td>{row.total_revenue?.toLocaleString()}</td>
                <td style={{ color: row.growth_percent >= 0 ? '#10b981' : '#ef4444' }}>{row.growth_percent}%</td>
                <td style={{ fontWeight: '800', color: '#d4af37' }}>{row.forecasted_revenue?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
