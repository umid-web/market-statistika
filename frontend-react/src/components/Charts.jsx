import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { RefreshCcw } from 'lucide-react';

const Charts = ({ trendData, countryData }) => {
  const COLORS = ['#d4af37', '#00f2ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'rgba(5, 10, 15, 0.95)', 
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--accent-gold-glow)',
          padding: '1.25rem',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
          zIndex: 1000
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: payload[0].color || 'var(--accent-gold)' }}></div>
            <p style={{ color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>
              {payload[0].value.toLocaleString()} <small style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>so'm</small>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
      {/* Revenue Trend Chart */}
      <div className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Daromad Trendi</h3>
          <div style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>OYLIK TAHLIL</div>
        </div>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="daromad" 
                stroke="var(--accent-gold)" 
                strokeWidth={4} 
                dot={{ r: 6, fill: 'var(--bg-main)', strokeWidth: 3, stroke: 'var(--accent-gold)' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Top Maxsulotlar (Foyda)</h3>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>TOP 5</div>
        </div>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="var(--text-secondary)" 
                fontSize={11} 
                width={120} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontWeight: '600' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                {countryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
