import React from 'react';
import { 
  BarChart3, 
  Target,
  Zap,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Trophy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { useStore } from '../context/StoreContext';

const Analytics = () => {
  const { analytics: data } = useStore();
  const COLORS = ['#d4af37', '#00f2ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const categoryData = Object.entries(data.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.total_profit;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const rankingData = Object.entries(data.reduce((acc, curr) => {
    const rank = curr.revenue_rank_in_month || 'Boshqa';
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name: `Rank #${name}`, value }));

  const topProducts = [...data].sort((a, b) => b.total_profit - a.total_profit).slice(0, 5);

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            <BarChart3 size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Chuqur Ma'lumotlar Tahlili (Spark AI)</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px' }} className="text-gradient-gold">Biznes Ko'rsatkichlari</h2>
        </div>
        <div className="glass-card premium-glow" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ma'lumotlar hajmi:</span>
          <span style={{ color: '#d4af37', fontWeight: '800', marginLeft: '0.5rem' }}>Big Data / Hadoop</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-card shimmer">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={20} color="#8b5cf6" /> Kategoriyalar Bo'yicha Foyda Tahlili
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ background: '#0a0e14', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={20} color="#d4af37" /> Spark Ranking Taqsimoti
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rankingData.length > 0 ? rankingData : [{name: 'Ma\'lumot yo\'q', value: 1}]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0a0e14', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {rankingData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card shimmer" style={{ borderTop: '2px solid #d4af37' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={20} color="#d4af37" /> Eng Muvaffaqiyatli Maxsulotlar (Spark AI Top 5)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {topProducts.map((p, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255,255,255,0.02)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid var(--glass-border)',
              position: 'relative',
              transition: 'var(--transition)'
            }} className="stat-hover">
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#10b981' }}><ArrowUpRight size={18} /></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Spark Rank #{idx + 1}</div>
              <div style={{ fontWeight: '700', marginBottom: '1rem', color: 'white' }}>{p.product_name}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#d4af37' }}>
                {(p.total_profit || 0).toLocaleString()} <small style={{fontSize: '0.7rem'}}>so'm</small>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
                JAMI {p.total_quantity} DONA SOTILGAN
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

