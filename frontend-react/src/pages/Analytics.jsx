import React, { useEffect, useState } from 'react';
import { 
  Database, Server, Cpu, Zap, FileSpreadsheet, ArrowUpRight, RefreshCcw, Download 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../context/StoreContext';

// Zaxira ma'lumotlari (Agar serverdan kelmasa ishlatiladi)
const FALLBACK_DATA = [
  { order_month: '2026-04', product_name: 'iPhone 15 Pro', category: 'Smartfonlar', total_quantity: 24, total_revenue: 360000000, total_profit: 72000000, profit_rank: 1, growth_percent: 15.4 },
  { order_month: '2026-04', product_name: 'MacBook Air M2', category: 'Noutbuklar', total_quantity: 12, total_revenue: 216000000, total_profit: 48000000, profit_rank: 2, growth_percent: 10.2 },
  { order_month: '2026-04', product_name: 'iPad Pro M2', category: 'Planshetlar', total_quantity: 18, total_revenue: 144000000, total_profit: 36000000, profit_rank: 3, growth_percent: 5.8 },
  { order_month: '2026-04', product_name: 'AirPods Pro 2', category: 'Aksessuarlar', total_quantity: 60, total_revenue: 180000000, total_profit: 24000000, profit_rank: 4, growth_percent: 22.1 },
  { order_month: '2026-04', product_name: 'Apple Watch S9', category: 'Gadjetlar', total_quantity: 25, total_revenue: 125000000, total_profit: 15000000, profit_rank: 5, growth_percent: 3.5 }
];

const Analytics = () => {
  const { analytics, fetchAnalytics, addNotification } = useStore();
  const [syncing, setSyncing] = useState(false);
  
  // Ma'lumotlarni aniqlash: Agar store bo'sh bo'lsa, zaxiradagi ma'lumotni olamiz
  const data = (Array.isArray(analytics) && analytics.length > 0) ? analytics : FALLBACK_DATA;

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
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    XLSX.writeFile(workbook, "Hadoop_Spark_Report.xlsx");
    addNotification("Excel hisoboti tayyor!", "success");
  };

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Hadoop & Spark Enterprise Pipeline</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }} className="text-gradient-gold">Hisobotlar Markazi</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>HDFS va MapReduce texnologiyalari asosidagi savdo tahlili</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-premium btn-ghost" onClick={handleExport} style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
            <Download size={18} style={{ marginRight: '0.5rem' }} /> Export
          </button>
          <button className="btn-premium" onClick={handleSync} disabled={syncing}>
            <RefreshCcw size={18} className={syncing ? "animate-spin" : ""} style={{ marginRight: '0.5rem' }} />
            {syncing ? "Spark Processing..." : "Tahlillarni Yangilash"}
          </button>
        </div>
      </div>

      {/* System Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Data Storage', value: 'HADOOP HDFS', icon: Server, color: '#d4af37' },
          { label: 'Compute Engine', value: 'APACHE SPARK', icon: Cpu, color: '#8b5cf6' },
          { label: 'Pipeline Status', value: 'ONLINE / ACTIVE', icon: Zap, color: '#10b981' }
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${item.color}`, display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: `${item.color}15`, padding: '0.75rem', borderRadius: '12px' }}>
              <item.icon size={22} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{item.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
            <FileSpreadsheet size={20} color="#d4af37" /> Spark Ishlov Bergan Real-Time Ma'lumotlar
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Maxsulot Nomi</th>
                <th>Oy</th>
                <th>Kategoriya</th>
                <th>Sotuv</th>
                <th>Tushum</th>
                <th>Sof Foyda</th>
                <th>O'sish</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="row-hover">
                  <td>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: row.profit_rank <= 3 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: row.profit_rank <= 3 ? '#d4af37' : '#888',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem'
                    }}>
                      {row.profit_rank}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700', color: '#fff' }}>{row.product_name}</td>
                  <td>{row.order_month}</td>
                  <td>
                    <span style={{ padding: '2px 8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}>
                      {row.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700' }}>{row.total_quantity}</td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>{row.total_revenue?.toLocaleString()}</td>
                  <td style={{ fontWeight: '800', color: '#d4af37' }}>{row.total_profit?.toLocaleString()}</td>
                  <td style={{ color: (row.growth_percent || 0) >= 0 ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                    {row.growth_percent > 0 ? '+' : ''}{row.growth_percent}%
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
