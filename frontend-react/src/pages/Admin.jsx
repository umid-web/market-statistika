import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../context/StoreContext';
import { 
  Package, 
  Plus, 
  Search, 
  Barcode, 
  FileText, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Save,
  Boxes,
  Zap,
  Tag,
  Warehouse,
  RefreshCcw
} from 'lucide-react';

import { API_BASE_URL } from '../api';

const Admin = () => {
  const { fetchProducts, products, addNotification } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Elektronika',
    brand: '',
    buy_price: '',
    sell_price: '',
    warehouse: 'Asosiy Ombor',
    stock: '',
    min_stock: '5',
    barcode: '',
    unit: 'dona'
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProduct.id}`, newProduct);
        addNotification("Maxsulot muvaffaqiyatli yangilandi!", "success");
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, newProduct);
        addNotification("Maxsulot muvaffaqiyatli qo'shildi!", "success");
      }
      setNewProduct({ name: '', sku: '', category: 'Elektronika', brand: '', buy_price: '', sell_price: '', warehouse: 'Asosiy Ombor', stock: '', min_stock: '5', barcode: '', unit: 'dona' });
      setShowAddForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || "Xatolik yuz berdi";
      addNotification(msg, "error");
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatdan ham bu maxsulotni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      addNotification("Maxsulot o'chirildi", "success");
      fetchProducts();
    } catch (err) {
      addNotification("O'chirishda xatolik", "error");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("DIQQAT! Ombordagi BARCHA maxsulotlar to'liq o'chib ketadi. Buni tasdiqlaysizmi?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/all`);
      addNotification("Barcha maxsulotlar to'liq o'chirildi!", "success");
      fetchProducts();
    } catch (err) {
      addNotification("O'chirishda xatolik", "error");
    }
  };

  return (
    <div className="inventory-module fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-gold)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Inventory Intelligence</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Ombor va Zaxiralar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Tovarlar qoldig'i va logistika zanjirini boshqarish paneli.</p>
        </div>

        <button className="btn-premium" onClick={() => {
          if (showAddForm) {
            setEditingProduct(null);
            setNewProduct({ name: '', sku: '', category: 'Elektronika', brand: '', buy_price: '', sell_price: '', warehouse: 'Asosiy Ombor', stock: '', min_stock: '5', barcode: '', unit: 'dona' });
          }
          setShowAddForm(!showAddForm);
        }} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
          <Plus size={22} /> {showAddForm ? "Yopish" : "Yangi Mahsulot Qo'shish"}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card animate-float" style={{ marginBottom: '4rem', padding: '3rem', border: '1px solid var(--accent-gold-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '50px', height: '50px', background: 'var(--accent-gold-soft)', borderRadius: '16px', marginBottom: '0' }}>
              <Zap size={24} color="var(--accent-gold)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                {editingProduct ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Ma'lumotlari"}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Barcha maydonlarni to'g'ri to'ldirilganligiga ishonch hosil qiling.</p>
            </div>
          </div>
          
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ gridColumn: '1 / span 2' }}>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem', letterSpacing: '1px' }}>MAHSULOT NOMI</label>
              <input className="premium-input" style={{ height: '55px', fontSize: '1.1rem' }} placeholder="Masalan: iPhone 15 Pro Max 256GB" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            </div>
            
            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>SKU / ARTIKUL</label>
              <input className="premium-input" style={{ height: '55px' }} placeholder="INV-2024-001" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
            </div>

            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>KATEGORIYA</label>
              <select className="premium-input" style={{ height: '55px' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="Elektronika">Elektronika</option>
                <option value="Kiyim-kechak">Kiyim-kechak</option>
                <option value="Maishiy texnika">Maishiy texnika</option>
                <option value="Oziq-ovqat">Oziq-ovqat</option>
                <option value="Avto-ehtiyot qismlar">Avto-ehtiyot qismlar</option>
              </select>
            </div>

            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>SOTIB OLISH NARXI</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="any" className="premium-input" style={{ height: '55px', color: 'var(--accent-gold)', fontWeight: '800' }} value={newProduct.buy_price} onChange={e => setNewProduct({...newProduct, buy_price: e.target.value})} required />
                <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>UZS</span>
              </div>
            </div>

            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>SOTISH NARXI</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="any" className="premium-input" style={{ height: '55px', color: 'var(--accent-emerald)', fontWeight: '800' }} value={newProduct.sell_price} onChange={e => setNewProduct({...newProduct, sell_price: e.target.value})} required />
                <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>UZS</span>
              </div>
            </div>

            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>MIQDOR (STOK)</label>
              <input type="number" step="any" className="premium-input" style={{ height: '55px' }} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
            </div>

            <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem' }}>OMBOR</label>
              <select className="premium-input" style={{ height: '55px' }} value={newProduct.warehouse} onChange={e => setNewProduct({...newProduct, warehouse: e.target.value})}>
                <option value="Asosiy Ombor">Asosiy Ombor</option>
                <option value="Toshkent Filiali">Toshkent Filiali</option>
                <option value="Samarqand Filiali">Samarqand Filiali</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-premium" style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem', justifyContent: 'center' }}>
                <Save size={24} /> {editingProduct ? "MAHSULOTNI YANGILASH" : "OMBORGA QO'SHISH"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">Ombor Inventarizatsiyasi</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Jami {products.length} turdagi mahsulotlar mavjud</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div style={{ position: 'relative', width: '350px' }}>
              <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
              <input className="premium-input" style={{ paddingLeft: '3.5rem', height: '50px' }} placeholder="Qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn-premium btn-ghost" style={{ color: '#ef4444', height: '50px', padding: '0 1.5rem' }} onClick={handleDeleteAll}>
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Mahsulot va SKU</th>
                <th>Kategoriya</th>
                <th>Ombor Manzili</th>
                <th>Narxlar</th>
                <th>Zaxira</th>
                <th>Holat</th>
                <th>Boshqaruv</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>#{p.sku || 'N/A'}</div>
                  </td>
                  <td>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      padding: '6px 12px', 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      color: 'var(--accent-gold)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Warehouse size={16} color="var(--accent-gold)" /> {p.warehouse}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '800' }}>{parseInt(p.sell_price).toLocaleString()} <small>UZS</small></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sotib olish: {parseInt(p.buy_price).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{p.stock} <small style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500'}}>{p.unit || 'ta'}</small></div>
                  </td>
                  <td>
                    {p.stock <= (p.min_stock || 5) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: '800', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '10px' }}>
                        <AlertTriangle size={16} /> KRITIK
                      </div>
                    ) : (
                      <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>FAOL</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.6rem', color: 'var(--accent-gold)' }} onClick={() => {
                        setEditingProduct(p);
                        setNewProduct(p);
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}><Edit size={18} /></button>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.6rem', color: '#ef4444' }} onClick={() => handleDelete(p.id)}><Trash2 size={18} /></button>
                    </div>
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

export default Admin;
