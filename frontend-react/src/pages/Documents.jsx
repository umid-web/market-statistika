import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Printer, 
  Download, 
  Eye, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Banknote,
  Archive,
  RefreshCcw,
  Clock,
  Lock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { API_BASE_URL } from '../api';
import { useStore } from '../context/StoreContext';

const Documents = () => {
  const { salesHistory: history, loading, fetchSalesHistory } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  const filteredHistory = (history || []).filter(item => {
    const matchesSearch = (item.order_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? item.order_date?.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('TIJORATPRO - Sotuv Hujjatlari', 14, 20);
    doc.setFontSize(10);
    doc.text(`Hisobot yaratilgan sana: ${new Date().toLocaleString()}`, 14, 28);
    
    const rows = filteredHistory.map(sale => [
      `#${sale.order_id}`,
      sale.order_date,
      sale.product_name,
      `${sale.quantity} ta`,
      `${Math.round(Number(sale.sell_price || 0) * Number(sale.quantity || 0)).toLocaleString()} UZS`,
      'TASDIQLANGAN'
    ]);
    const cols = ['Chek ID', 'Sana', 'Mahsulot', 'Miqdor', 'Jami', 'Holat'];
    
    // @ts-ignore
    doc.autoTable({ 
      head: [cols], 
      body: rows, 
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [5, 10, 15], textColor: [226, 183, 74] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    doc.save('tijoratpro_hisobot.pdf');
  };

  const generateSinglePDF = (sale, autoPrint = false) => {
    const doc = new jsPDF({ format: [80, 200] });
    doc.setFontSize(14);
    doc.text("TIJORATPRO STORE", 40, 10, { align: 'center' });
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

  return (
    <div className="documents-view fadeIn">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-gold)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Transaction Archive</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Hujjatlar Arshivi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Barcha moliyaviy operatsiyalar va cheklar tarixi.</p>
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

          <button className="btn-premium btn-ghost" onClick={fetchSalesHistory} style={{ height: '55px', width: '55px', borderRadius: '14px', padding: '0' }}>
            <RefreshCcw size={22} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="btn-premium btn-ghost" onClick={() => setShowFilter(!showFilter)} style={{ height: '55px', borderRadius: '14px', padding: '0 1.5rem', gap: '0.75rem' }}>
            <Filter size={20} /> {showFilter ? "Filtrni Yopish" : "Filtrlar"}
          </button>
          <button className="btn-premium" onClick={handleDownloadPDF} style={{ height: '55px', borderRadius: '14px', padding: '0 1.75rem', gap: '0.75rem' }}>
            <Archive size={20} /> Export (PDF)
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="glass-card animate-float" style={{ marginBottom: '3rem', padding: '2.5rem', border: '1px solid var(--accent-gold-glow)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Operatsiya Sanasi</label>
            <input 
              type="date" 
              className="premium-input" 
              style={{ height: '55px', borderRadius: '12px' }}
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>To'lov Turi</label>
            <select className="premium-input" style={{ height: '55px', borderRadius: '12px', fontWeight: '700' }}>
              <option value="all">Barchasi</option>
              <option value="cash">Naqd</option>
              <option value="card">Plastik Karta</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-premium btn-ghost" style={{ height: '55px', width: '100%', borderRadius: '12px', color: '#ef4444' }} onClick={() => { setDateFilter(''); setSearchTerm(''); }}>
              Tozalash
            </button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 10, 15, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}>
          <div className="glass-card animate-float" style={{ width: '450px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', border: '1px solid var(--accent-gold-glow)', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setSelectedSale(null)}
            >
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
              <h2 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '0.5rem' }}>TIJORATPRO</h2>
              <div style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', width: 'fit-content', margin: '0 auto', textTransform: 'uppercase', letterSpacing: '2px' }}>Archive Receipt</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Sana & Vaqt</div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{selectedSale.order_date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Chek ID</div>
                <div style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>#{selectedSale.order_id}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ fontWeight: '800', color: '#fff' }}>{selectedSale.product_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedSale.quantity} ta × {Number(selectedSale.sell_price).toLocaleString()} UZS</div>
                </div>
                <div style={{ fontWeight: '900', color: 'var(--accent-gold)', textAlign: 'right' }}>
                  {(selectedSale.quantity * selectedSale.sell_price).toLocaleString()}
                </div>
              </div>
              <div style={{ borderTop: '1px dashed var(--glass-border)', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>UMUMIY SUMMA:</span>
                <span className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '900' }}>{(selectedSale.quantity * selectedSale.sell_price).toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500'}}>UZS</small></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button className="btn-premium btn-ghost" style={{ flex: 1, height: '60px' }} onClick={() => generateSinglePDF(selectedSale, true)}>
                <Printer size={20} /> Chop Etish
              </button>
              <button className="btn-premium" style={{ flex: 1, height: '60px' }} onClick={() => generateSinglePDF(selectedSale, false)}>
                <Download size={20} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Tranzaksiyalar Reestri</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Arxivda <strong style={{color: '#fff'}}>{history.length}</strong> ta operatsiya mavjud</p>
          </div>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
            <input className="premium-input" style={{ paddingLeft: '3.75rem', height: '55px', borderRadius: '14px' }} placeholder="Chek ID bo'yicha qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2.5rem' }}>ID</th>
                <th>Operatsiya Sanasi</th>
                <th>Mahsulot</th>
                <th>Miqdor</th>
                <th>Umumiy Summa</th>
                <th>Status</th>
                <th style={{ paddingRight: '2.5rem', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((sale, idx) => (
                <tr key={idx}>
                  <td style={{ paddingLeft: '2.5rem', fontWeight: '900', color: 'var(--accent-gold)' }}>#{sale.order_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>
                      <Clock size={16} color="var(--accent-gold)" /> {sale.order_date}
                    </div>
                  </td>
                  <td style={{ fontWeight: '800', fontSize: '1rem' }}>{sale.product_name}</td>
                  <td><div style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{sale.quantity} ta</div></td>
                  <td>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>
                      {Math.round(Number(sale.sell_price || 0) * Number(sale.quantity || 0)).toLocaleString()} <small style={{fontSize: '0.7rem'}}>UZS</small>
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.6rem', 
                      color: 'var(--accent-emerald)', 
                      fontSize: '0.75rem', 
                      fontWeight: '900',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '6px 14px',
                      borderRadius: '12px',
                      width: 'fit-content',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <ShieldCheck size={16} /> TASDIQLANGAN
                    </div>
                  </td>
                  <td style={{ paddingRight: '2.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn-premium btn-ghost" style={{ width: '42px', height: '42px', padding: '0', color: 'var(--accent-gold)', borderRadius: '10px' }} onClick={() => setSelectedSale(sale)}><Eye size={20} /></button>
                      <button className="btn-premium btn-ghost" style={{ width: '42px', height: '42px', padding: '0', color: '#fff', borderRadius: '10px' }} onClick={() => generateSinglePDF(sale, true)}><Printer size={20} /></button>
                      <button className="btn-premium btn-ghost" style={{ width: '42px', height: '42px', padding: '0', color: '#fff', borderRadius: '10px' }} onClick={() => generateSinglePDF(sale, false)}><Download size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '1.1rem' }}>Hujjatlar arshivi bo'sh yoki ma'lumot topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
