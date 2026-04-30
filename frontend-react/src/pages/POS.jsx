import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Users, 
  ShoppingBag, 
  X,
  PlusCircle,
  QrCode,
  ArrowRight,
  Printer,
  Download
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

import { API_BASE_URL } from '../api';

const POS = () => {
  const { products, cart, addToCart, removeFromCart, clearCart, updateCartQuantity, addNotification, fetchProducts, fetchAnalytics, fetchSalesHistory } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('MEHMON');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [dailyStats, setDailyStats] = useState({ revenue: 0, orders: 0, items: 0 });

  const fetchDailyStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sales-history`);
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const todaySales = res.data.filter(s => s.order_date?.startsWith(today));
      const revenue = todaySales.reduce((acc, s) => acc + (Number(s.sell_price) * Number(s.quantity)), 0);
      const orders = new Set(todaySales.map(s => s.order_id)).size;
      const items = todaySales.reduce((acc, s) => acc + Number(s.quantity), 0);
      setDailyStats({ revenue, orders, items });
    } catch (err) {}
  };

  // Filter products by name, category, SKU or barcode
  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customers`);
        setCustomers(res.data);
      } catch (err) {}
    };
    fetchCustomers();
    fetchDailyStats();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F2') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F3') {
        e.preventDefault();
        document.getElementById('pos-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 150);
    } catch(e) {}
  };

  

  const subTotal = cart.reduce((acc, item) => acc + (item.sell_price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          sku: item.sku,
          category: item.category,
          buy_price: item.buy_price,
          sell_price: item.sell_price,
          quantity: item.quantity,
          customer_id: selectedCustomer,
          warehouse: item.warehouse || 'Asosiy Ombor'
        }))
      };
      
      const res = await axios.post(`${API_BASE_URL}/api/sales`, payload);
      
      setReceiptData({
        order_id: res.data.order_id,
        items: [...cart],
        total: subTotal,
        customer: selectedCustomer,
        date: new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      });
      setShowReceipt(true);
      
      addNotification("Sotuv muvaffaqiyatli!", "success");
      playBeep();
      clearCart();
      fetchProducts();
      fetchDailyStats();
      fetchSalesHistory();
      
      // Spark job tugashini kutamiz va tahlillarni yangilaymiz
      setTimeout(() => {
        fetchAnalytics();
      }, 5000);
    } catch (err) {
      addNotification("Xatolik yuz berdi!", "error");
    }
  };

  return (
    <div className="pos-grid" style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      
      {showReceipt && receiptData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card" style={{ width: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37', letterSpacing: '1px', marginBottom: '0.5rem' }}>V-ERP PRO</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manzil: Toshkent sh., Chilonzor</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tel: +998 90 123 45 67</p>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Sana:</span>
                <strong>{receiptData.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Chek ID:</span>
                <strong>{receiptData.order_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Mijoz:</span>
                <strong>{receiptData.customer}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #666', borderBottom: '1px dashed #666', padding: '1rem 0' }}>
              {receiptData.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.quantity} x {item.sell_price.toLocaleString()} so'm</div>
                  </div>
                  <div style={{ fontWeight: '800' }}>
                    {(item.quantity * item.sell_price).toLocaleString()} so'm
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>JAMI YAKUN:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{receiptData.total.toLocaleString()} so'm</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-premium btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                const doc = new jsPDF({ format: [80, 200] });
                doc.setFontSize(14);
                doc.text("V-ERP PRO STORE", 40, 10, { align: 'center' });
                doc.setFontSize(10);
                doc.text(`Sana: ${receiptData.date}`, 5, 20);
                doc.text(`Chek ID: ${receiptData.order_id}`, 5, 25);
                doc.text("-----------------------------------------", 5, 30);
                let y = 35;
                receiptData.items.forEach(item => {
                  doc.text(`${item.name}`, 5, y);
                  doc.text(`${item.quantity} x ${item.sell_price.toLocaleString()}`, 5, y+5);
                  doc.text(`${(item.quantity * item.sell_price).toLocaleString()}`, 75, y+5, { align: 'right' });
                  y += 10;
                });
                doc.text("-----------------------------------------", 5, y);
                doc.setFontSize(12);
                doc.text(`JAMI: ${receiptData.total.toLocaleString()} so'm`, 5, y+10);
                doc.save(`chek_${receiptData.order_id}.pdf`);
              }}>
                <Download size={18} /> Yuklash
              </button>
              <button className="btn-premium" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowReceipt(false); setReceiptData(null); }}>
                Yangi Sotuv
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Kunlik Tushum Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          padding: '1.25rem',
          background: 'rgba(212, 175, 55, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.15)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Bugungi Tushum</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>{Math.round(dailyStats.revenue).toLocaleString()} <small style={{ fontSize: '0.7rem', color: '#666' }}>so'm</small></div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Cheklar Soni</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>{dailyStats.orders} <small style={{ fontSize: '0.7rem', color: '#666' }}>ta</small></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Sotilgan Mahsulot</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>{dailyStats.items} <small style={{ fontSize: '0.7rem', color: '#666' }}>birlik</small></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
            <input 
              id="pos-search"
              className="premium-input" 
              placeholder="Maxsulot nomi, SKU yoki Barcode... (F3)" 
              style={{ paddingLeft: '3.5rem' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <button className="btn-premium btn-ghost" style={{ padding: '1rem' }} onClick={() => addNotification("Skaner qurilmasi topilmadi yoki ulanmagan!", "error")}><QrCode size={20} /></button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.5rem', 
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card" 
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => addToCart(product)}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{product.category}</div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.3' }}>{product.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zaxira: {product.stock} {product.unit || 'ta'}</div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'white', marginTop: '0.25rem' }}>{Math.round(Number(product.sell_price || 0)).toLocaleString()} <small style={{fontSize: '0.7rem'}}>so'm</small></div>
                </div>
                <div style={{ background: 'var(--accent-gold)', color: 'black', borderRadius: '8px', padding: '4px' }}>
                  <PlusCircle size={20} />
                </div>
              </div>
              {product.stock <= 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#ef4444' }}>TUGAGAN</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
        <div style={{ padding: '1.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag color="#d4af37" size={22} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Savat</h3>
          </div>
          <button className="btn-premium btn-ghost" style={{ padding: '0.5rem', color: '#ef4444' }} onClick={clearCart} title="Tozalash (F2)">
            <Trash2 size={18} /> <span className="hotkey-hint" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>F2</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.25rem', 
              paddingBottom: '1.25rem', 
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={e => updateCartQuantity(item.id, e.target.value)}
                    style={{ width: '60px', padding: '0.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}
                    min="0.01"
                    step="any"
                    max={item.stock}
                  />
                  <span>{item.unit || 'ta'} x {Math.round(Number(item.sell_price || 0)).toLocaleString()} so'm</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', color: 'white' }}>{Math.round(Number(item.sell_price || 0) * Number(item.quantity || 0)).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                   <X size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.id)} />
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
              <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <div>Savat bo'sh</div>
            </div>
          )}
        </div>

        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Sotuvchi:</span>
            <span>Admin</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Jami Summa:</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#d4af37' }}>{subTotal.toLocaleString()} <small style={{fontSize: '0.9rem'}}>so'm</small></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button 
              className={`nav-item ${paymentType === 'cash' ? 'active' : ''}`} 
              style={{ justifyContent: 'center', marginBottom: '0' }}
              onClick={() => setPaymentType('cash')}
            >
              <Banknote size={20} /> Naqd
            </button>
            <button 
              className={`nav-item ${paymentType === 'card' ? 'active' : ''}`} 
              style={{ justifyContent: 'center', marginBottom: '0' }}
              onClick={() => setPaymentType('card')}
            >
              <CreditCard size={20} /> Karta
            </button>
          </div>

          <button className="btn-premium" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }} onClick={handleCheckout}>
            To'lovni Tasdiqlash <ArrowRight size={20} /> <span className="hotkey-hint">F1</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
