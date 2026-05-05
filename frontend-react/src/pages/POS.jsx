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
      
      // Barcha ma'lumotlarni darhol yangilaymiz
      fetchProducts();
      fetchDailyStats();
      fetchSalesHistory();
      fetchAnalytics();
    } catch (err) {
      addNotification("Xatolik yuz berdi!", "error");
    }
  };

  return (
    <div className="pos-grid fadeIn" style={{ position: 'relative' }}>
      
      {showReceipt && receiptData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
          <div className="glass-card animate-float" style={{ width: '450px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', border: '1px solid var(--accent-gold-glow)' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
              <h2 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '0.5rem' }}>V-ERP PRO</h2>
              <div style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', width: 'fit-content', margin: '0 auto', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Receipt</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sana</div>
                <div style={{ fontWeight: '700' }}>{receiptData.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Chek ID</div>
                <div style={{ fontWeight: '700', color: 'var(--accent-purple)' }}>#{receiptData.order_id}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
              {receiptData.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} {item.unit || 'ta'} x {item.sell_price.toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                    {(item.quantity * item.sell_price).toLocaleString()}
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>JAMI:</span>
                <span className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '900' }}>{receiptData.total.toLocaleString()} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>UZS</small></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-premium btn-ghost" style={{ flex: 1 }} onClick={() => {
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
                <Download size={18} /> PDF
              </button>
              <button className="btn-premium" style={{ flex: 1.5 }} onClick={() => { setShowReceipt(false); setReceiptData(null); }}>
                Yangi Sotuv
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Professional Summary Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(226, 183, 74, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Bugungi Tushum</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-emerald)', letterSpacing: '-1px' }}>
              {Math.round(dailyStats.revenue).toLocaleString()} <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UZS</small>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Tranzaksiyalar</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>
              {dailyStats.orders} <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ta</small>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Sotuv Hajmi</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>
              {dailyStats.items} <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>birlik</small>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} size={22} />
            <input 
              id="pos-search"
              className="premium-input" 
              placeholder="Mahsulot nomi, SKU yoki Barcode... (F3)" 
              style={{ paddingLeft: '4rem', fontSize: '1rem', height: '60px', borderRadius: '18px' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button className="btn-premium btn-ghost" style={{ width: '60px', height: '60px', borderRadius: '18px' }} onClick={() => addNotification("Skaner topilmadi!", "error")}><QrCode size={24} /></button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '2rem', 
          overflowY: 'auto',
          paddingRight: '1rem',
          maxHeight: 'calc(100vh - 450px)'
        }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="glass-card" 
              style={{ 
                cursor: 'pointer', 
                padding: '1.5rem', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
              onClick={() => addToCart(product)}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#fff', height: '45px', overflow: 'hidden' }}>{product.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Omborda: {product.stock} {product.unit}</div>
                  <div style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>{Math.round(product.sell_price).toLocaleString()}</div>
                </div>
                <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'var(--accent-gold-soft)', borderRadius: '12px', marginBottom: '0' }}>
                  <PlusCircle size={20} color="var(--accent-gold)" />
                </div>
              </div>
              {product.stock <= 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#ef4444', letterSpacing: '2px' }}>OUT OF STOCK</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', background: 'var(--bg-sidebar)' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', background: 'var(--accent-gold-soft)', borderRadius: '12px', marginBottom: '0' }}>
              <ShoppingBag color="var(--accent-gold)" size={20} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Savat</h3>
          </div>
          <button className="btn-premium btn-ghost" style={{ padding: '0.6rem', color: '#ef4444', borderRadius: '12px' }} onClick={clearCart}>
            <Trash2 size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {cart.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              gap: '1.25rem', 
              marginBottom: '1.5rem', 
              paddingBottom: '1.5rem', 
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px' }}>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={e => updateCartQuantity(item.id, e.target.value)}
                      style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }}
                      min="0.01"
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>x {item.sell_price.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>{(item.sell_price * item.quantity).toLocaleString()}</div>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', marginTop: '0.5rem', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ opacity: 0.1, marginBottom: '1.5rem' }}><ShoppingBag size={80} /></div>
              <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Savat bo'sh</div>
            </div>
          )}
        </div>

        <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Jami Yakun:</span>
            <div style={{ textAlign: 'right' }}>
              <div className="text-gold" style={{ fontSize: '2.25rem', fontWeight: '900' }}>{subTotal.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>O'zbek so'mi</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={`btn-premium ${paymentType === 'cash' ? '' : 'btn-ghost'}`} 
              onClick={() => setPaymentType('cash')}
              style={{ padding: '1rem' }}
            >
              <Banknote size={20} /> Naqd
            </button>
            <button 
              className={`btn-premium ${paymentType === 'card' ? '' : 'btn-ghost'}`} 
              onClick={() => setPaymentType('card')}
              style={{ padding: '1rem' }}
            >
              <CreditCard size={20} /> Karta
            </button>
          </div>

          <button className="btn-premium" style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }} onClick={handleCheckout}>
            TO'LOVNI TASDIQLASH <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
