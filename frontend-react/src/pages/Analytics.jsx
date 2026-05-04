import React, { useEffect, useState } from 'react';
import { 
  Database, Server, Cpu, Zap, FileSpreadsheet, ArrowUpRight, RefreshCcw, Download, TrendingUp, BrainCircuit 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../context/StoreContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, BarChart, Bar
} from 'recharts';

const Analytics = () => {
  const { analytics, fetchAnalytics, addNotification } = useStore();
  const [syncing, setSyncing] = useState(false);
  
  const data = Array.isArray(analytics) ? analytics : [];

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

  // Chart ma'lumotlarini tayyorlash
  const chartData = data.slice(0, 6).map(item => ({
    name: item.product_name.substring(0, 8),
    Hozirgi: item.total_revenue,
    Bashorat: item.forecasted_revenue
  }));

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Enterprise Big Data Pipeline</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }} className="text-gradient-gold">Hadoop Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Differentsial bashoratlar va real-vaqt ma'lumotlar oqimi</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-premium btn-ghost" onClick={handleExport} style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
            <Download size={18} style={{ marginRight: '0.5rem' }} /> Export
          </button>
          <button className="btn-premium" onClick={handleSync} disabled={syncing}>
            <RefreshCcw size={18} className={syncing ? "animate-spin" : ""} style={{ marginRight: '0.5rem' }} />
            {syncing ? "Computing..." : "Sparkni Yangilash"}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Forecast Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#d4af37" /> S(t) Bashorat Grafiklari (Real vs Forecast)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#0a0e14', border: '1px solid #d4af37', borderRadius: '8px' }}
                itemStyle={{ fontSize: '0.8rem' }}
              />
              <Area type="monotone" dataKey="Hozirgi" stroke="#d4af37" fillOpacity={1} fill="url(#colorH)" />
              <Area type="monotone" dataKey="Bashorat" stroke="#10b981" fillOpacity={1} fill="url(#colorB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Strategic Insights */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={20} color="#8b5cf6" /> AI Strategik Tavsiyalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '10px', borderLeft: '3px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>{item.product_name}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.25rem' }}>
                  {item.growth_percent > 10 
                    ? `Kutilayotgan o'sish +${item.growth_percent}%. Zaxirani 20% ga oshirish tavsiya etiladi.` 
                    : `Sotuvlar barqaror. Marketing aksiyalari orqali tushumni ko'paytirish mumkin.`}
                </div>
              </div>
            ))}
            {data.length === 0 && <p style={{ fontSize: '0.8rem', color: '#666' }}>Ma'lumotlar tahlil qilinmoqda...</p>}
          </div>
        </div>
      </div>

      {/* Main Results Box */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(212, 175, 55, 0.2)', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '12px', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '12px' }}>
            <Zap size={24} color="#d4af37" />
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '900' }}>Spark Matematik Bashorat Natijalari</h4>
            <p style={{ color: '#d4af37', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Differentsial Model: S(t) = S₀eᵏᵗ</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>Jami Kutilayotgan Tushum</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>
              {data.reduce((acc, curr) => acc + (curr.forecasted_revenue || 0), 0).toLocaleString()} UZS
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>O'rtacha O'sish Koeffitsienti</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#d4af37' }}>
              {(data.reduce((acc, curr) => acc + (curr.growth_percent || 0), 0) / (data.length || 1)).toFixed(1)}%
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>Tizim Ishonchliligi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#3b82f6' }}>96.8%</div>
          </div>
        </div>
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
                <th>O'sish (%)</th>
                <th style={{ background: 'rgba(212, 175, 55, 0.05)', color: '#d4af37' }}>Matematik Bashorat</th>
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
                  <td style={{ fontWeight: '900', color: '#d4af37', background: 'rgba(212, 175, 55, 0.03)' }}>
                    {row.forecasted_revenue?.toLocaleString()} <span style={{ fontSize: '0.6rem', color: '#888' }}>UZS</span>
                    <ArrowUpRight size={14} style={{ marginLeft: '5px' }} />
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
