import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Printer, Download, Eye, Calendar, ShieldCheck, Search, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { API_BASE_URL } from '../api';

const Documents = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sales-history`);
        setHistory(res.data.reverse());
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.order_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || item.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? item.order_date?.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Sotuv Hujjatlari', 14, 20);
    const rows = filteredHistory.map(sale => [
      sale.order_id,
      sale.order_date,
      sale.product_name,
      `${sale.quantity} ta`,
      `${Math.round(Number(sale.sell_price || 0) * Number(sale.quantity || 0)).toLocaleString()} so'm`,
      'TASDIQLANGAN'
    ]);
    const cols = ['Chek ID', 'Sanasi', 'Maxsulot', 'Miqdor', 'Umumiy Summa', 'Status'];
    // @ts-ignore
    doc.autoTable({ head: [cols], body: rows, startY: 30 });
    doc.save('sotuv_hujjatlari.pdf');
  };

  const generateSinglePDF = (sale, autoPrint = false) => {
    const doc = new jsPDF({ format: [80, 200] });
    doc.setFontSize(14);
    doc.text("V-ERP PRO STORE", 40, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Sana: ${sale.order_date}`, 5, 20);
    doc.text(`Chek ID: ${sale.order_id}`, 5, 25);
    doc.text("-----------------------------------------", 5, 30);
    doc.text(`${sale.product_name}`, 5, 35);
    doc.text(`${sale.quantity} x ${Number(sale.sell_price || 0).toLocaleString()}`, 5, 40);
    doc.text(`${(sale.quantity * sale.sell_price).toLocaleString()}`, 75, 40, { align: 'right' });
    doc.text("-----------------------------------------", 5, 45);
    doc.setFontSize(12);
    doc.text(`JAMI: ${(sale.quantity * sale.sell_price).toLocaleString()} so'm`, 5, 55);
    
    if (autoPrint) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`chek_${sale.order_id}.pdf`);
    }
  };

  const handleView = (sale) => {
    setSelectedSale(sale);
  };

  return (
    <div className="documents-module" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            <FileText size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Hujjatlar Arshivi</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>Sotuv Hujjatlari va Cheklar</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-premium btn-ghost" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={18} /> Filtr
          </button>
          <button className="btn-premium" onClick={handleDownloadPDF}><Download size={18} /> Hisobot (PDF)</button>
        </div>
      </div>

      {showFilter && (
        <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Sana bo'yicha filtr</label>
            <input 
              type="date" 
              className="premium-input" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Status bo'yicha</label>
            <select className="premium-input">
              <option value="all">Barchasi</option>
              <option value="tasdiqlangan">Tasdiqlangan</option>
            </select>
          </div>
          <button className="btn-premium btn-ghost" style={{ marginTop: '1.5rem' }} onClick={() => setDateFilter('')}>Filtrni tozalash</button>
        </div>
      )}

      {selectedSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card" style={{ width: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              onClick={() => setSelectedSale(null)}
            >
              X
            </button>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37', letterSpacing: '1px', marginBottom: '0.5rem' }}>V-ERP PRO</h2>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Sana:</span><strong>{selectedSale.order_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Chek ID:</span><strong>{selectedSale.order_id}</strong>
              </div>
            </div>
            <div style={{ borderTop: '1px dashed #666', borderBottom: '1px dashed #666', padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700' }}>{selectedSale.product_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{selectedSale.quantity} x {selectedSale.sell_price.toLocaleString()} so'm</div>
                </div>
                <div style={{ fontWeight: '800' }}>{(selectedSale.quantity * selectedSale.sell_price).toLocaleString()} so'm</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>JAMI YAKUN:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{(selectedSale.quantity * selectedSale.sell_price).toLocaleString()} so'm</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-premium btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => generateSinglePDF(selectedSale, true)}>
                <Printer size={18} /> Chop Etish
              </button>
              <button className="btn-premium" style={{ flex: 1, justifyContent: 'center' }} onClick={() => generateSinglePDF(selectedSale, false)}>
                <Download size={18} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3>Tranzaksiyalar Tarixi</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input className="premium-input" style={{ paddingLeft: '3rem' }} placeholder="Chek raqami bo'yicha..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Chek ID</th>
                <th>Operatsiya Sanasi</th>
                <th>Maxsulot Nomi</th>
                <th>Miqdor</th>
                <th>Umumiy Summa</th>
                <th>Status</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((sale, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '800', color: '#8b5cf6' }}>{sale.order_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <Calendar size={14} color="#666" /> {sale.order_date}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>{sale.product_name}</td>
                  <td>{sale.quantity} ta</td>
                  <td style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                    {Math.round(Number(sale.sell_price || 0) * Number(sale.quantity || 0)).toLocaleString()} <small>so'm</small>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      color: '#10b981', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      width: 'fit-content'
                    }}>
                      <ShieldCheck size={14} /> TASDIQLANGAN
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleView(sale)}><Eye size={16} /></button>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.5rem' }} onClick={() => generateSinglePDF(sale, true)}><Printer size={16} /></button>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.5rem' }} onClick={() => generateSinglePDF(sale, false)}><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Hujjatlar mavjud emas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
