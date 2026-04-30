import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const Charts = ({ trendData, countryData }) => {
  const COLORS = ['#d4af37', '#00f2ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'rgba(10, 14, 20, 0.9)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
          <p style={{ color: '#d4af37', fontWeight: '800', fontSize: '1.1rem' }}>
            {payload[0].value.toLocaleString()} <small>so'm</small>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Daromad Trendi (Oylik)</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="daromad" 
                stroke="#d4af37" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#d4af37', strokeWidth: 2, stroke: '#05080d' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Top Maxsulotlar (Foyda)</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
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
