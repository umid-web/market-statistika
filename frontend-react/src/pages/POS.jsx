import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  Trash2, 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  X,
  Plus,
  Minus,
  QrCode,
  ArrowRight,
  Printer,
  TrendingUp,
  Package,
  CheckCircle2,
  Lock,
  Calculator,
  Scan,
  LayoutGrid,
  Delete,
  Zap,
  ArrowLeft,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../api';

const POS = () => {
  const { 
    products, cart, addToCart, removeFromCart, clearCart, 
    updateCartQuantity, addNotification, fetchProducts, 
    fetchAnalytics, fetchSalesHistory 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [dailyStats, setDailyStats] = useState({ revenue: 0, orders: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receivedCash, setReceivedCash] = useState('');
  
  const searchInputRef = useRef(null);

  const fetchDailyStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sales-history`);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const todaySales = res.data.filter(s => s.order_date?.startsWith(todayStr));
      const revenue = todaySales.reduce((acc, s) => acc + (Number(s.sell_price) * Number(s.quantity)), 0);
      const orders = new Set(todaySales.map(s => s.order_id)).size;
      setDailyStats({ revenue, orders });
    } catch (err) {}
  };

  useEffect(() => {
    const init = async () => {
      fetchDailyStats();
      fetchProducts();
    };
    init();
    searchInputRef.current?.focus();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') { e.preventDefault(); handleCheckout(); }
      if (e.key === 'F2') { e.preventDefault(); clearCart(); }
      if (e.key === 'F3') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F4') { e.preventDefault(); setPaymentType(prev => prev === 'cash' ? 'card' : 'cash'); }
      if (e.key === 'Escape') { setShowReceipt(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentType]);

  const categories = useMemo(() => {
    const cats = ['Barchasi', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.barcode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Barchasi' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const subTotal = cart.reduce((acc, item) => acc + (Number(item.sell_price) * Number(item.quantity)), 0);
  const totalItems = cart.reduce((acc, item) => acc + Number(item.quantity), 0);
  const change = receivedCash ? (Number(receivedCash) - subTotal) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          category: item.category,
          buy_price: item.buy_price,
          sell_price: item.sell_price,
          quantity: item.quantity,
          customer_id: 'MEHMON',
          warehouse: item.warehouse || 'Asosiy Ombor'
        }))
      };
      
      const res = await axios.post(`${API_BASE_URL}/api/sales`, payload);
      
      setReceiptData({
        order_id: res.data.order_id,
        items: [...cart],
        total: subTotal,
        payment: paymentType,
        received: receivedCash || subTotal,
        change: change > 0 ? change : 0,
        date: new Date().toLocaleString()
      });
      setShowReceipt(true);
      
      addNotification("Sotuv muvaffaqiyatli yakunlandi", "success");
      clearCart();
      setReceivedCash('');
      fetchProducts();
      fetchDailyStats();
    } catch (err) {
      addNotification("Checkout xatosi: " + (err.response?.data?.detail || "Server xatosi"), "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const quickCashAmounts = [1000, 5000, 10000, 50000, 100000, 200000];

  const generatePDF = (data) => {
    const doc = new jsPDF({ format: [80, 150] });
    doc.setFontSize(14);
    doc.text("TIJORATPRO ERP", 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Sana: ${data.date}`, 5, 20);
    doc.text(`ID: ${data.order_id}`, 5, 24);
    doc.text("-".repeat(40), 5, 28);
    let y = 32;
    data.items.forEach(it => {
      doc.text(`${it.name}`, 5, y);
      doc.text(`${it.quantity} x ${it.sell_price.toLocaleString()} = ${(it.quantity*it.sell_price).toLocaleString()}`, 5, y+4);
      y += 10;
    });
    doc.text("-".repeat(40), 5, y);
    doc.setFontSize(10);
    doc.text(`JAMI: ${data.total.toLocaleString()} UZS`, 5, y+8);
    doc.text(`TO'LANDI: ${Number(data.received).toLocaleString()} UZS`, 5, y+13);
    doc.text(`QAYTIM: ${Number(data.change).toLocaleString()} UZS`, 5, y+18);
    doc.save(`receipt_${data.order_id}.pdf`);
  };

  return (
    <div className="pos-view fadeIn">
      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="modal-overlay">
          <div className="receipt-glass-modal animate-float">
            <div className="receipt-sparkle-bg"></div>
            <div className="receipt-content">
              <div className="success-lottie-mock">
                <CheckCircle2 size={60} color="var(--accent-emerald)" strokeWidth={1.5} />
              </div>
              <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>Sotuv Yakunlandi</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '1px' }}>TRANZAKSIYA #{receiptData.order_id}</p>
              
              <div className="receipt-financials">
                <div className="receipt-main-total">
                   <span>UMUMIY TO'LOV</span>
                   <strong>{receiptData.total.toLocaleString()} <small>UZS</small></strong>
                </div>
                <div className="receipt-sub-details">
                  <div className="sub-row">
                    <span>To'lov Usuli</span>
                    <span className="pill-gold">{receiptData.payment === 'cash' ? '💵 NAQD' : '💳 KARTA'}</span>
                  </div>
                  <div className="sub-row">
                    <span>Qaytim</span>
                    <span className="text-emerald" style={{ fontWeight: '900', fontSize: '1.2rem' }}>{receiptData.change.toLocaleString()} UZS</span>
                  </div>
                </div>
              </div>

              <div className="receipt-actions-v2">
                <button className="btn-premium" style={{ height: '60px' }} onClick={() => generatePDF(receiptData)}>
                  <Printer size={20} /> CHEKNI CHOP ETISH
                </button>
                <button className="btn-premium btn-ghost" style={{ height: '60px' }} onClick={() => setShowReceipt(false)}>
                  <ArrowLeft size={20} /> YANGI SOTUV (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pos-main-container">
        {/* Compact Header */}
        <div className="pos-header-v3">
          <div className="header-left">
            <div className="pos-search-box-v3">
              <Search className="search-icon-pos" size={20} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Mahsulot yoki barcode... (F3)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="kbd-hint">F3</div>
            </div>
          </div>

          <div className="header-right">
            <div className="pos-stats-v3">
               <div className="pos-stat-item">
                  <TrendingUp size={16} color="var(--accent-emerald)" />
                  <span>{dailyStats.revenue.toLocaleString()}</span>
               </div>
            </div>
            <button className="lock-btn-v3" onClick={() => window.lockScreen && window.lockScreen()}>
              <Lock size={18} />
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="pos-categories-v3 custom-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`cat-pill-v3 ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid - Denser Layout */}
        <div className="pos-grid-container custom-scrollbar">
          <div className="pos-grid-v3">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className={`product-card-v3 ${product.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => {
                  if(product.stock > 0) {
                    addToCart(product);
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }
                }}
              >
                <div className="card-badge-v3">
                  {product.stock} {product.unit}
                </div>
                <div className="card-body-v3">
                  <h4 className="card-title-v3">{product.name}</h4>
                  <div className="card-footer-v3">
                    <span className="card-price-v3">{Number(product.sell_price).toLocaleString()}</span>
                    <div className="card-add-v3"><Plus size={16} /></div>
                  </div>
                </div>
                {product.stock <= 0 && <div className="out-of-stock-v3">TUGAGAN</div>}
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="pos-empty-v3">
               <Scan size={60} strokeWidth={1} opacity={0.3} />
               <p>Mahsulot topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Side Intelligence Panel - Fixed Width 400px */}
      <div className="pos-side-panel-v3">
        <div className="side-header-v3">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div className="cart-badge-v3">{totalItems}</div>
             <span style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '1px' }}>SAVATCHA</span>
           </div>
           <button className="side-clear-btn" onClick={clearCart} title="Tozalash (F2)">
             <Trash2 size={18} />
           </button>
        </div>

        <div className="side-cart-list custom-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="cart-item-v3">
              <div style={{ flex: 1 }}>
                <div className="item-name-v3">{item.name}</div>
                <div className="item-details-v3">
                   <div className="qty-picker-v3">
                     <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}><Minus size={12} /></button>
                     <input value={item.quantity} onChange={(e) => updateCartQuantity(item.id, e.target.value)} />
                     <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}><Plus size={12} /></button>
                   </div>
                   <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>× {item.sell_price.toLocaleString()}</span>
                </div>
              </div>
              <div className="item-total-v3">{(item.quantity * item.sell_price).toLocaleString()}</div>
              <button className="item-remove-v3" onClick={() => removeFromCart(item.id)}><X size={14} /></button>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="empty-cart-v3">
               <ShoppingBag size={50} strokeWidth={1} opacity={0.2} />
               <p>Savat bo'sh</p>
            </div>
          )}
        </div>

        <div className="side-footer-v3">
          {/* Payment Toggle Only - No Customer Select */}
          <div className="payment-toggle-v3">
            <button className={paymentType === 'cash' ? 'active' : ''} onClick={() => setPaymentType('cash')}>NAQD (F4)</button>
            <button className={paymentType === 'card' ? 'active' : ''} onClick={() => setPaymentType('card')}>KARTA (F4)</button>
          </div>

          {paymentType === 'cash' && (
            <div className="cash-area-v3">
              <div className="cash-input-row-v3">
                 <input 
                  type="number" 
                  placeholder="Summani kiriting..." 
                  value={receivedCash}
                  onChange={(e) => setReceivedCash(e.target.value)}
                 />
                 <Calculator size={18} color="var(--accent-gold)" />
              </div>
              <div className="quick-cash-grid-v3">
                {quickCashAmounts.map(amt => (
                  <button key={amt} onClick={() => setReceivedCash(prev => String(Number(prev || 0) + amt))}>
                    +{amt >= 1000 ? (amt/1000 + 'K') : amt}
                  </button>
                ))}
                <button onClick={() => setReceivedCash('')} style={{ color: '#ef4444' }}><Delete size={16} /></button>
              </div>
            </div>
          )}

          <div className="summary-area-v3">
            <div className="summary-row-v3">
              <span>Savatda: {totalItems} ta</span>
              {receivedCash > 0 && <span>Qaytim: <strong style={{color: 'var(--accent-emerald)'}}>{change.toLocaleString()}</strong></span>}
            </div>
            <div className="total-display-v3">
               <div className="total-label-v3">UMUMIY SUMMA</div>
               <div className="total-value-v3">{subTotal.toLocaleString()} <small>UZS</small></div>
            </div>
          </div>

          <button 
            className="master-checkout-btn-v3" 
            disabled={cart.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? (
              <RefreshCcw size={24} className="animate-spin" />
            ) : (
              <>
                <QrCode size={22} />
                <span>YAKUNLASH (F1)</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pos-view {
          display: grid;
          grid-template-columns: 1fr 400px;
          height: calc(100vh - 40px);
          overflow: hidden;
          background: #050a0f;
        }

        .pos-main-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          overflow: hidden;
        }

        /* Compact Header V3 */
        .pos-header-v3 {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pos-search-box-v3 {
          position: relative;
          width: 500px;
        }

        .search-icon-pos {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--accent-gold);
          opacity: 0.6;
        }

        .pos-search-box-v3 input {
          width: 100%;
          height: 50px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 0 3.5rem;
          color: #fff;
          font-weight: 600;
        }

        .pos-stats-v3 {
          display: flex;
          gap: 1rem;
        }

        .pos-stat-item {
          background: rgba(255,255,255,0.02);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .lock-btn-v3 {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          color: var(--accent-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Category Pills V3 */
        .pos-categories-v3 {
          display: flex;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }

        .cat-pill-v3 {
          padding: 0.6rem 1.25rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--text-muted);
          font-weight: 800;
          font-size: 0.75rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .cat-pill-v3.active {
          background: var(--accent-gold);
          color: #000;
          border-color: var(--accent-gold);
        }

        /* Product Grid V3 - Industrial Density */
        .pos-grid-container {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .pos-grid-v3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }

        .product-card-v3 {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1rem;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 140px;
        }

        .product-card-v3:hover {
          border-color: var(--accent-gold);
          background: rgba(255,255,255,0.04);
          transform: translateY(-3px);
        }

        .card-badge-v3 {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-muted);
          background: rgba(255,255,255,0.05);
          width: fit-content;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .card-title-v3 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          margin: 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }

        .card-footer-v3 {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-price-v3 {
          font-weight: 900;
          color: var(--accent-emerald);
          font-size: 1.1rem;
        }

        .card-add-v3 {
          width: 28px;
          height: 28px;
          background: var(--accent-gold-soft);
          color: var(--accent-gold);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .out-of-stock-v3 {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          color: #ef4444;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          border-radius: 16px;
        }

        /* Side Panel V3 */
        .pos-side-panel-v3 {
          display: flex;
          flex-direction: column;
          background: #0a0f14;
          border-left: 1px solid var(--glass-border);
        }

        .side-header-v3 {
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-badge-v3 {
          background: var(--accent-gold);
          color: #000;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 900;
          font-size: 0.9rem;
        }

        .side-clear-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .side-cart-list {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .cart-item-v3 {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .item-name-v3 { font-weight: 700; font-size: 0.85rem; color: #fff; margin-bottom: 0.5rem; }

        .item-details-v3 { display: flex; align-items: center; gap: 0.75rem; }

        .qty-picker-v3 {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 2px;
        }

        .qty-picker-v3 button {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .qty-picker-v3 input {
          width: 35px;
          background: transparent;
          border: none;
          color: #fff;
          text-align: center;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .item-total-v3 { font-weight: 900; color: var(--accent-gold); font-size: 1rem; }

        .item-remove-v3 {
          background: transparent;
          border: none;
          color: #ef4444;
          opacity: 0.3;
          cursor: pointer;
        }

        .cart-item-v3:hover .item-remove-v3 { opacity: 1; }

        .side-footer-v3 {
          padding: 1.5rem;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid var(--glass-border);
        }

        .payment-toggle-v3 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .payment-toggle-v3 button {
          height: 40px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.02);
          color: var(--text-muted);
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.7rem;
          cursor: pointer;
        }

        .payment-toggle-v3 button.active {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-color: var(--accent-gold);
        }

        .cash-area-v3 { margin-bottom: 1.5rem; }

        .cash-input-row-v3 {
          position: relative;
          margin-bottom: 0.5rem;
        }

        .cash-input-row-v3 input {
          width: 100%;
          height: 50px;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--accent-gold-soft);
          border-radius: 12px;
          padding: 0 1rem;
          color: var(--accent-gold);
          font-size: 1.4rem;
          font-weight: 900;
          text-align: right;
          padding-right: 3rem;
        }

        .cash-input-row-v3 svg { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); }

        .quick-cash-grid-v3 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }

        .quick-cash-grid-v3 button {
          height: 35px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }

        .summary-area-v3 { margin-bottom: 1.5rem; }

        .summary-row-v3 {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .total-display-v3 {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .total-label-v3 { font-size: 0.7rem; font-weight: 900; color: var(--text-muted); }
        .total-value-v3 { font-size: 1.8rem; font-weight: 900; color: var(--accent-gold); }

        .master-checkout-btn-v3 {
          width: 100%;
          height: 65px;
          background: var(--accent-gold);
          border: none;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #000;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(226, 183, 74, 0.2);
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 10, 15, 0.95);
          backdrop-filter: blur(15px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .receipt-glass-modal {
          width: 440px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--accent-gold-glow);
          border-radius: 40px;
          padding: 3.5rem;
          text-align: center;
          position: relative;
        }

        .receipt-financials {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255,255,255,0.02);
          border-radius: 24px;
        }

        .receipt-main-total { margin-bottom: 1.5rem; border-bottom: 1px dashed var(--glass-border); padding-bottom: 1.5rem; }
        .receipt-main-total strong { font-size: 2.5rem; color: var(--accent-gold); display: block; }
        .sub-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem; }
        .pill-gold { background: var(--accent-gold-soft); color: var(--accent-gold); padding: 2px 10px; border-radius: 8px; font-weight: 900; font-size: 0.7rem; }
      ` }} />
    </div>
  );
};

export default POS;
