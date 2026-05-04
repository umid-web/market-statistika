import React, { useEffect } from 'react';
import { 
  Cpu, RefreshCcw, BarChart3, BrainCircuit, FileSpreadsheet
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { analytics, fetchAnalytics, loading } = useStore();
  
  // Ma'lumotlarni xavfsiz formatlash
  const data = Array.isArray(analytics) ? analytics : [];

  useEffect(() => {
    fetchAnalytics().catch(err => console.error("Fetch error:", err));
  }, []);

  const totalRevenue = data.reduce((acc, curr) => acc + (Number(curr.total_revenue) || 0), 0);
  const totalProfit = data.reduce((acc, curr) => acc + (Number(curr.total_profit) || 0), 0);

  return (
    <div className="analytics-view" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>Business Analytics</h2>
          <p style={{ color: '#888' }}>Spark tizimi tomonidan tahlil qilingan real vaqtdagi ma'lumotlar</p>
        </div>
        <button className="btn-premium" onClick={() => fetchAnalytics()} disabled={loading}>
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} style={{ marginRight: '0.5rem' }} />
          Yangilash
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Umumiy Tushum</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{totalRevenue.toLocaleString()} UZS</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sof Foyda</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{totalProfit.toLocaleString()} UZS</div>
        </div>
      </div>

      {/* Analysis List */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={24} color="#d4af37" /> Mahsulotlar Tahlili (Top 10)
        </h3>
        
        {data.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.slice(0, 10).map((item, idx) => (
              <div key={idx} style={{ 
                padding: '1.25rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#fff' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '900', color: '#10b981' }}>{Number(item.total_revenue).toLocaleString()} UZS</div>
                  <div style={{ fontSize: '0.8rem', color: '#d4af37' }}>{item.total_quantity} dona sotilgan</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
            <Cpu size={48} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.1 }} />
            <p>Ma'lumotlar tahlil qilinmoqda...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
