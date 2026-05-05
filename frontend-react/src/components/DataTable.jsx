import React from 'react';
import { FileSpreadsheet, Star, Trophy } from 'lucide-react';
import * as XLSX from 'xlsx';

const DataTable = ({ data }) => {
  const handleExport = () => {
    const excelData = data.slice(0, 10).map((row, idx) => ({
      'Reyting (Spark)': row.profit_rank || (idx + 1),
      'Maxsulot Nomi': row.product_name || '-',
      'Hisobot Oyi': row.order_month,
      'Kategoriya': row.category || '-',
      'Sotuv Miqdori (ta)': row.total_quantity || 0,
      "Jami Tushum (so'm)": row.total_revenue || 0,
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    XLSX.writeFile(workbook, "V_ERP_Pro_Analytics.xlsx");
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', border: 'none', background: 'transparent', backdropFilter: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileSpreadsheet size={28} className="text-gold" />
            <span className="text-gradient">Performance Analytics</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Top performing products and their monthly growth dynamics</p>
        </div>
        <button className="btn-premium" onClick={exportToExcel} style={{ fontSize: '0.8rem', padding: '0.7rem 1.5rem' }}>
          <FileSpreadsheet size={18} /> Export Data
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product Name</th>
              <th>Month</th>
              <th>Category</th>
              <th>Volume</th>
              <th>Revenue</th>
              <th>Net Profit</th>
              <th>Dynamics</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ 
                    width: '36px', height: '36px', 
                    borderRadius: '12px', 
                    background: row.profit_rank === 1 ? 'var(--accent-gold-soft)' : 'rgba(255,255,255,0.03)',
                    color: row.profit_rank === 1 ? 'var(--accent-gold)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800',
                    border: `1px solid ${row.profit_rank === 1 ? 'var(--accent-gold-glow)' : 'var(--glass-border)'}`
                  }}>
                    {row.profit_rank || (idx + 1)}
                  </div>
                </td>
                <td style={{ fontWeight: '700', color: '#fff' }}>{row.product_name || 'Unknown'}</td>
                <td>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{row.order_month || '-'}</span>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {row.category || '-'}
                  </span>
                </td>
                <td style={{ fontWeight: '700' }}>{row.total_quantity || 0} units</td>
                <td style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>{(row.total_revenue || 0).toLocaleString()} <small>UZS</small></td>
                <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{(row.total_profit || 0).toLocaleString()} <small>UZS</small></td>
                <td>
                  <div style={{ 
                    color: (row.growth_percent || 0) > 0 ? 'var(--accent-emerald)' : (row.growth_percent || 0) < 0 ? '#ef4444' : 'var(--text-muted)', 
                    fontWeight: '800', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: (row.growth_percent || 0) > 0 ? 'rgba(16, 185, 129, 0.1)' : (row.growth_percent || 0) < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    width: 'fit-content',
                    fontSize: '0.85rem'
                  }}>
                    {(row.growth_percent || 0) > 0 ? <TrendingUp size={14} /> : (row.growth_percent || 0) < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                    {(row.growth_percent || 0) > 0 ? '+' : ''}{(row.growth_percent || 0).toFixed(1)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
