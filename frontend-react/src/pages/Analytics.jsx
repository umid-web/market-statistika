import React from 'react';
import { 
  Database, 
  Server, 
  Cpu, 
  Zap, 
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCcw,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { analytics, fetchAnalytics, addNotification } = useStore();
  const [syncing, setSyncing] = React.useState(false);
  const data = Array.isArray(analytics) ? analytics : [];

  const handleSync = async () => {
    try {
      setSyncing(true);
      await fetchAnalytics();
      addNotification("Big Data ma'lumotlari yangilandi", "success");
    } catch (err) {
      addNotification("Sinxronizatsiyada xatolik", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      addNotification("Eksport qilish uchun ma'lumot yo'q!", "error");
      return;
    }
    const excelData = data.map((row) => ({
      'Reyting (Spark)': row.profit_rank,
      'Maxsulot Nomi': row.product_name,
      'Hisobot Oyi': row.order_month,
      'Kategoriya': row.category,
      'Sotuv Miqdori': row.total_quantity,
      'Jami Tushum': row.total_revenue,
      'Sof Foyda': row.total_profit,
      'O\'sish (%)': row.growth_percent
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Spark Analytics");
    XLSX.writeFile(workbook, "Spark_BigData_Hisoboti.xlsx");
    addNotification("Excel hisoboti yuklab olindi", "success");
  };

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Database size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Hadoop & Spark Analytics Pipeline</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px' }} className="text-gradient-gold">Hisobotlar Markazi</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Big Data muhitida qayta ishlangan sotuvlar tahlili</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-premium btn-ghost" onClick={handleExport} style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <Download size={18} style={{ marginRight: '0.75rem' }} /> Export (Excel)
          </button>
          <button className="btn-premium" onClick={handleSync} disabled={syncing}>
            <RefreshCcw size={18} className={syncing ? "animate-spin" : ""} style={{ marginRight: '0.75rem' }} />
            {syncing ? "Spark Processing..." : "Tahlillarni Yangilash"}
          </button>
        </div>
      </div>

      {/* System Status Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #d4af37' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Server size={24} color="#d4af37" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data Storage</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>HADOOP HDFS</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Cpu size={24} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Compute Engine</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>APACHE SPARK</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Zap size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pipeline Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>ONLINE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={20} color="#d4af37" /> Spark Ishlov Bergan Ma'lumotlar
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
             Jami: <strong>{data.length}</strong> ta tahliliy qator
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Maxsulot Nomi</th>
                <th>Hisobot Oyi</th>
                <th>Kategoriya</th>
                <th>Miqdor</th>
                <th>Jami Tushum</th>
                <th>Sof Foyda</th>
                <th>Dinamika</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} style={{ transition: 'var(--transition)' }} className="row-hover">
                  <td>
                    <div style={{ 
                      width: '28px', height: '28px', 
                      borderRadius: '50%', 
                      background: row.profit_rank === 1 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: row.profit_rank === 1 ? '#d4af37' : '#888',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.75rem'
                    }}>
                      {row.profit_rank}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>{row.product_name}</td>
                  <td style={{ color: '#888' }}>{row.order_month}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: 'rgba(139, 92, 246, 0.1)', 
                      color: '#8b5cf6', 
                      borderRadius: '20px', 
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      {row.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700' }}>{row.total_quantity}</td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>{row.total_revenue?.toLocaleString()}</td>
                  <td style={{ fontWeight: '800', color: '#d4af37' }}>{row.total_profit?.toLocaleString()}</td>
                  <td>
                    <div style={{ 
                      color: (row.growth_percent || 0) >= 0 ? '#10b981' : '#ef4444', 
                      fontWeight: '800', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      fontSize: '0.85rem'
                    }}>
                      {(row.growth_percent || 0) > 0 ? '+' : ''}{row.growth_percent}%
                      {(row.growth_percent || 0) !== 0 && <ArrowUpRight size={14} style={{ transform: (row.growth_percent || 0) < 0 ? 'rotate(90deg)' : 'none' }} />}
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '5rem' }}>
                    <div style={{ color: '#666' }}>
                      <Database size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p>Hozircha tahlil ma'lumotlari mavjud emas.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Sotuv qiling va Spark Pipeline-ni ishga tushiring.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
