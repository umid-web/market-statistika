import React from 'react';

const StatsGrid = ({ kpis }) => {
  return (
    <div className="stats-grid">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="glass-card stat-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon-wrapper" style={{ 
              background: kpi.bg || `rgba(255,255,255,0.03)`, 
              border: `1px solid ${kpi.color}30`,
              boxShadow: `0 8px 20px ${kpi.color}15`
            }}>
              <kpi.icon size={26} color={kpi.color} strokeWidth={2.5} />
            </div>
            
            {kpi.trend && (
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                color: kpi.trend.startsWith('+') ? 'var(--accent-emerald)' : '#ef4444',
                background: kpi.trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '6px 12px',
                borderRadius: '10px',
                border: `1px solid ${kpi.trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                backdropFilter: 'blur(5px)'
              }}>
                {kpi.trend}
              </div>
            )}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <div className="stat-label">{kpi.title}</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="text-gradient">{kpi.value}</span>
              {kpi.unit && (
                <small style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-muted)', 
                  fontWeight: '500',
                  letterSpacing: '0'
                }}>
                  {kpi.unit}
                </small>
              )}
            </div>
          </div>
          
          {/* Subtle Glow Effect */}
          <div style={{ 
            position: 'absolute', 
            width: '100px', 
            height: '100px', 
            background: kpi.color, 
            filter: 'blur(80px)', 
            bottom: '-50px', 
            right: '-50px', 
            opacity: 0.05,
            pointerEvents: 'none'
          }}></div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
