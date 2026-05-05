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
    <div className="analytics-view fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-purple)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Spark Cluster Analytics</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Business Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Spark va Hadoop ekotizimi orqali qayta ishlangan real-vaqtdagi tahlillar.</p>
        </div>

        <button className="btn-premium" onClick={() => fetchAnalytics()} disabled={loading} style={{ padding: '1rem 2rem' }}>
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} style={{ marginRight: '0.75rem' }} />
          Tahlilni Yangilash
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Umumiy Tushum</span>
            <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '0' }}>
              <BarChart3 size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <h3 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            {totalRevenue.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>UZS</small>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '800' }}>Real-vaqt tizimidagi ma'lumot</div>
        </div>

        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-purple)', padding: '2rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Sof Foyda</span>
            <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', marginBottom: '0' }}>
              <BrainCircuit size={20} color="var(--accent-purple)" />
            </div>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
            {totalProfit.toLocaleString()} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>UZS</small>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: '800' }}>AI tomonidan hisoblangan ko'rsatkich</div>
        </div>
      </div>

      {/* Detailed Analysis List */}
      <div className="glass-card" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Mahsulotlar Tahlili (Top 10)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sotuv hajmi bo'yicha eng yuqori ko'rsatkichli tovarlar</p>
          </div>
          <button className="btn-premium btn-ghost" style={{ height: '50px', padding: '0 1.5rem' }}>
            <FileSpreadsheet size={18} /> Eksport
          </button>
        </div>
        
        {data.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {data.slice(0, 10).map((item, idx) => (
              <div key={idx} className="glass-card" style={{ 
                padding: '1.5rem', 
                background: 'rgba(255,255,255,0.01)', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--glass-border)',
                transition: 'var(--transition)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '900',
                    color: 'var(--accent-gold)',
                    fontSize: '1rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '900', color: 'var(--accent-emerald)', fontSize: '1.25rem' }}>{Number(item.total_revenue).toLocaleString()} <small style={{fontSize: '0.75rem'}}>UZS</small></div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: '700' }}>{item.total_quantity} dona sotilgan</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <Cpu size={60} className="animate-spin" style={{ marginBottom: '2rem', opacity: 0.1, color: 'var(--accent-gold)' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>Ma'lumotlar tahlil qilinmoqda...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
