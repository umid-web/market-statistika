import React from 'react';

const StatsGrid = ({ kpis }) => {
  return (
    <div className="stats-grid">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="glass-card stat-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ 
              background: kpi.bg || `${kpi.color}20`, 
              padding: '0.75rem', 
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <kpi.icon size={24} color={kpi.color} strokeWidth={2.5} />
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: kpi.trend.startsWith('+') ? '#10b981' : '#ef4444',
              background: kpi.trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {kpi.trend}
            </div>
          </div>
          <div className="stat-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>{kpi.title}</div>
          <div className="stat-value" style={{ color: 'white', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            {kpi.value} 
            {kpi.unit && <small style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{kpi.unit}</small>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
