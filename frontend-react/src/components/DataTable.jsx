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
      "Sof Foyda (so'm)": row.total_profit || 0,
      "O'sish Dinamikasi (%)": row.growth_percent || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Kengliklarni sozlash (Xunuk chiqmasligi uchun)
    worksheet['!cols'] = [
      {wch: 15}, {wch: 25}, {wch: 15}, {wch: 20}, 
      {wch: 18}, {wch: 20}, {wch: 20}, {wch: 22}
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top Maxsulotlar");
    
    XLSX.writeFile(workbook, "Top_Maxsulotlar_Hisoboti.xlsx");
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <FileSpreadsheet size={20} style={{ verticalAlign: 'middle', marginRight: '0.75rem', color: '#d4af37' }} />
            Maxsulotlar Bo'yicha Batafsil Tahlil
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Top 10 eng foydali maxsulotlar va ularning oylik ko'rsatkichlari</p>
        </div>
        <button className="btn-premium btn-ghost" style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }} onClick={handleExport}>Eksport (Excel)</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Reyting (Spark AI)</th>
              <th>Maxsulot Nomi</th>
              <th>Hisobot Oyi</th>
              <th>Kategoriya</th>
              <th>Sotuv Miqdori</th>
              <th>Jami Tushum</th>
              <th>Sof Foyda</th>
              <th>O'sish Dinamikasi</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ 
                    width: '32px', height: '32px', 
                    borderRadius: '50%', 
                    background: row.profit_rank === 1 ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: row.profit_rank === 1 ? '#d4af37' : '#888',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800'
                  }}>
                    {row.profit_rank || (idx + 1)}
                  </div>
                </td>
                <td style={{ fontWeight: '700' }}>{row.product_name}</td>
                <td>{row.order_month}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{row.category}</td>
                <td style={{ fontWeight: '700' }}>{row.total_quantity} ta</td>
                <td style={{ color: '#10b981', fontWeight: '800' }}>{row.total_revenue?.toLocaleString()} so'm</td>
                <td style={{ color: '#d4af37', fontWeight: '800' }}>{row.total_profit?.toLocaleString()} so'm</td>
                <td>
                  <div style={{ 
                    color: (row.growth_percent || 0) >= 0 ? '#10b981' : '#ef4444', 
                    fontWeight: '800', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    background: (row.growth_percent || 0) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    width: 'fit-content'
                  }}>
                    {(row.growth_percent || 0) > 0 ? '+' : ''}{(row.growth_percent || 0)}%
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
