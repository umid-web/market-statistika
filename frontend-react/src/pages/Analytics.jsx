import React, { useEffect, useMemo } from 'react';
import { 
  Cpu, 
  RefreshCcw, 
  BarChart3, 
  BrainCircuit, 
  FileSpreadsheet, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Zap,
  Target,
  Trophy,
  Lock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { 
    analytics, 
    salesHistory, 
    predictions,
    fetchAnalytics, 
    fetchSalesHistory, 
    fetchPredictions,
    loading 
  } = useStore();
  
  const data = Array.isArray(analytics) ? analytics : [];
  const sales = Array.isArray(salesHistory) ? salesHistory : [];

  useEffect(() => {
    fetchAnalytics().catch(err => console.error("Fetch error:", err));
    fetchSalesHistory().catch(() => {});
    fetchPredictions().catch(() => {});
  }, []);

  const totalRevenue = useMemo(() =>
    sales.reduce((acc, s) => acc + (Number(s.sell_price || 0) * Number(s.quantity || 0)), 0)
  , [sales]);

  const totalProfit = useMemo(() =>
    sales.reduce((acc, s) => acc + ((Number(s.sell_price || 0) - Number(s.buy_price || 0)) * Number(s.quantity || 0)), 0)
  , [sales]);

  const totalOrders = useMemo(() =>
    new Set(sales.map(s => s.order_id)).size
  , [sales]);

  const topProducts = useMemo(() => {
    const map = {};
    const source = data.length > 0 ? data : sales;
    
    source.forEach(item => {
      const name = item.product_name;
      if (!name) return;
      if (!map[name]) map[name] = { product_name: name, category: item.category || '-', total_revenue: 0, total_quantity: 0 };
      
      if (data.length > 0) {
        map[name].total_revenue += Number(item.total_revenue || 0);
        map[name].total_quantity += Number(item.total_quantity || 0);
      } else {
        map[name].total_revenue += Number(item.sell_price || 0) * Number(item.quantity || 0);
        map[name].total_quantity += Number(item.quantity || 0);
      }
    });
    
    return Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10);
  }, [data, sales]);

  const maxRevenue = useMemo(() => Math.max(...topProducts.map(p => p.total_revenue), 1), [topProducts]);

  return (
    <div className="analytics-view fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-purple)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Spark Cloud Cluster</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Business Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Spark ML va Hadoop ekotizimi orqali qayta ishlangan real-vaqt tahlillari.</p>
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
            onClick={() => window.lockScreen && window.lockScreen()}
          >
            <Lock size={18} />
            Qulflash
          </button>

          <button className="btn-premium" onClick={() => fetchAnalytics()} disabled={loading} style={{ height: '55px', padding: '0 2rem', borderRadius: '16px', gap: '0.75rem' }}>
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            Tahlilni Yangilash
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="stats-grid" style={{ marginBottom: '4rem' }}>
        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div className="stat-label">Umumiy Tushum</div>
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{totalRevenue.toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>UZS</small></div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderRadius: '14px' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            <Activity size={16} /> Real-vaqt savdo oqimi faol
          </div>
        </div>

        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-purple)', padding: '2.5rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div className="stat-label">Sof Foyda</div>
              <div className="stat-value" style={{ color: '#fff' }}>{totalProfit.toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>UZS</small></div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', borderRadius: '14px' }}>
              <Zap size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            <Target size={16} /> Oylik maqsad: <span style={{color: 'var(--accent-purple)'}}>75% bajarildi</span>
          </div>
        </div>

        <div className="glass-card stat-item animate-float" style={{ borderLeft: '4px solid var(--accent-gold)', padding: '2.5rem', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div className="stat-label">Tranzaksiyalar</div>
              <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{totalOrders.toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>ta</small></div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)', borderRadius: '14px' }}>
              <PieChart size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            <Trophy size={16} /> O'rtacha chek: <span style={{color: 'var(--accent-gold)'}}>{(totalOrders > 0 ? Math.round(totalRevenue/totalOrders) : 0).toLocaleString()} UZS</span>
          </div>
        </div>
      </div>

      {/* Predictive Analytics Section - ODE Model */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '45px', height: '45px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Ilmiy Bashorat (Differensial Model)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>dS/dt = rS (Malthusian Growth) modeli asosida kelajakdagi daromad prognozi.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {(predictions || []).slice(0, 3).map((p, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(165deg, rgba(139, 92, 246, 0.05) 0%, rgba(5, 10, 15, 0.4) 100%)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                 <span style={{ fontWeight: '800', color: '#fff' }}>{p.product_name}</span>
                 <span style={{ fontSize: '0.7rem', background: 'var(--accent-purple)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '900' }}>{p.model}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '4px' }}>JORIY DAROMAD</div>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{p.current_revenue.toLocaleString()}</div>
                  </div>
                  <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: '800', marginBottom: '4px' }}>1 OYDAN KEYIN</div>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{p.forecast_next_month.toLocaleString()}</div>
                  </div>
               </div>
               <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>3 oylik prognoz:</span>
                    <span style={{ fontWeight: '900', color: 'var(--accent-gold)' }}>{p.forecast_3_months.toLocaleString()} UZS</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Leaderboard Section */}
      <div className="glass-card" style={{ padding: '3.5rem', border: '1px solid var(--glass-border)', background: 'rgba(5, 10, 15, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.8px' }} className="text-gradient">Top Mahsulotlar Reytingi</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>Bozor ulushi va daromadlilik bo'yicha yetakchi tovarlar tahlili.</p>
          </div>
          <button className="btn-premium btn-ghost" style={{ borderRadius: '14px', height: '55px', padding: '0 2rem' }}>
            <FileSpreadsheet size={20} /> Excel Export
          </button>
        </div>
        
        {topProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {topProducts.map((item, idx) => (
              <div key={idx} style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ 
                      width: '45px', 
                      height: '45px', 
                      background: idx === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '900',
                      color: idx === 0 ? '#000' : 'var(--text-muted)',
                      fontSize: '1.1rem',
                      boxShadow: idx === 0 ? '0 5px 15px var(--accent-gold-glow)' : 'none'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.15rem' }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{item.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '900', color: idx === 0 ? 'var(--accent-gold)' : '#fff', fontSize: '1.4rem' }}>{Math.round(item.total_revenue).toLocaleString()} <small style={{fontSize: '0.8rem', opacity: 0.6}}>UZS</small></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', marginTop: '4px' }}>{item.total_quantity} dona sotilgan</div>
                  </div>
                </div>
                {/* Progress Bar Visual */}
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(item.total_revenue / maxRevenue) * 100}%`, 
                    background: idx === 0 ? 'linear-gradient(90deg, #e2b74a, #b8860b)' : 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                    borderRadius: '10px',
                    boxShadow: idx === 0 ? '0 0 10px var(--accent-gold-glow)' : 'none',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8rem 0' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem' }}>
               <Cpu size={100} className="animate-spin" style={{ opacity: 0.05, color: 'var(--accent-gold)' }} />
               <Activity size={40} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--accent-gold)', opacity: 0.2 }} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '600', letterSpacing: '0.5px' }}>Big Data klasteridan ma'lumotlar kutilmoqda...</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Spark operatsiyalari fon rejimida ishlamoqda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
