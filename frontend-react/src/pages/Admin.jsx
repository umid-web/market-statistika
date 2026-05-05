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
  RefreshCcw,
  LayoutGrid,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Lock,
  MoreVertical
} from 'lucide-react';

import { API_BASE_URL } from '../api';

const Admin = () => {
  const { fetchProducts, products, addNotification, loading } = useStore();
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
        addNotification("Mahsulot muvaffaqiyatli yangilandi!", "success");
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, newProduct);
        addNotification("Mahsulot muvaffaqiyatli qo'shildi!", "success");
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
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatdan ham bu mahsulotni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      addNotification("Mahsulot o'chirildi", "success");
      fetchProducts();
    } catch (err) {
      addNotification("O'chirishda xatolik", "error");
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    const headers = ["ID", "Nomi", "SKU", "Kategoriya", "Kirim Narxi", "Sotish Narxi", "Zaxira", "Birlik", "Ombor"];
    const rows = products.map(p => [p.id, p.name, p.sku, p.category, p.buy_price, p.sell_price, p.stock, p.unit, p.warehouse]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventar_hisoboti_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    addNotification("Excel hisoboti tayyorlandi!", "success");
  };

  return (
    <div className="inventory-view fadeIn">
      {/* Premium Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-gold)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Inventory Control</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Ombor Boshqaruvi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Zaxira qoldiqlari, mahsulotlar katalogi va logistikani nazorat qilish.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn-premium btn-ghost" 
            style={{ height: '55px', padding: '0 1.5rem', borderColor: 'rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)', gap: '0.5rem' }}
            onClick={() => window.lockScreen && window.lockScreen()}
          >
            <Lock size={18} />
            Qulflash
          </button>
          
          <button className="btn-premium btn-ghost" onClick={fetchProducts} style={{ padding: '0.8rem', width: '55px', height: '55px', borderRadius: '14px' }}>
            <RefreshCcw size={22} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button className="btn-premium" onClick={() => {
            if (showAddForm) {
              setEditingProduct(null);
              setNewProduct({ name: '', sku: '', category: 'Elektronika', brand: '', buy_price: '', sell_price: '', warehouse: 'Asosiy Ombor', stock: '', min_stock: '5', barcode: '', unit: 'dona' });
            }
            setShowAddForm(!showAddForm);
          }} style={{ padding: '1rem 2.5rem', fontSize: '1rem', borderRadius: '18px', gap: '0.75rem' }}>
            {showAddForm ? <LayoutGrid size={22} /> : <Plus size={22} />} 
            {showAddForm ? "Katalog" : "Yangi Mahsulot"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card animate-float" style={{ marginBottom: '4rem', padding: '4rem', border: '1px solid var(--accent-gold-glow)', background: 'linear-gradient(135deg, rgba(226, 183, 74, 0.05) 0%, rgba(5, 10, 15, 0.4) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '65px', height: '65px', background: 'var(--accent-gold-soft)', borderRadius: '20px', marginBottom: '0', border: '1px solid var(--accent-gold-glow)' }}>
              <Zap size={30} color="var(--accent-gold)" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.8px' }}>
                {editingProduct ? "Mahsulot Redaktori" : "Yangi Tovar Qo'shish"}
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Barcha texnik va moliyaviy parametrlarni kiriting.</p>
            </div>
          </div>
          
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            <div style={{ gridColumn: '1 / span 2' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Mahsulot Nomi</label>
              <input className="premium-input" style={{ height: '65px', fontSize: '1.15rem', borderRadius: '18px' }} placeholder="Masalan: MacBook Pro M3 Max" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            </div>
            
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>SKU / Artikol</label>
              <input className="premium-input" style={{ height: '65px', borderRadius: '18px' }} placeholder="TJR-2024-X" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Kategoriya</label>
              <select className="premium-input" style={{ height: '65px', borderRadius: '18px', fontWeight: '800' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="Elektronika">💻 Elektronika</option>
                <option value="Kiyim-kechak">👗 Kiyim-kechak</option>
                <option value="Maishiy texnika">🏠 Maishiy texnika</option>
                <option value="Oziq-ovqat">🍎 Oziq-ovqat</option>
                <option value="Avto-ehtiyot qismlar">🚗 Avto-ehtiyot qismlar</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Kirim Narxi</label>
              <input type="number" step="any" className="premium-input" style={{ height: '65px', borderRadius: '18px', color: 'var(--accent-gold)', fontWeight: '900', paddingRight: '4rem' }} value={newProduct.buy_price} onChange={e => setNewProduct({...newProduct, buy_price: e.target.value})} required />
              <span style={{ position: 'absolute', right: '1.5rem', top: '55px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>UZS</span>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Sotish Narxi</label>
              <input type="number" step="any" className="premium-input" style={{ height: '65px', borderRadius: '18px', color: 'var(--accent-emerald)', fontWeight: '900', paddingRight: '4rem' }} value={newProduct.sell_price} onChange={e => setNewProduct({...newProduct, sell_price: e.target.value})} required />
              <span style={{ position: 'absolute', right: '1.5rem', top: '55px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>UZS</span>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Zaxira Miqdori</label>
              <input type="number" step="any" className="premium-input" style={{ height: '65px', borderRadius: '18px', fontWeight: '800' }} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>O'lchov Birligi</label>
              <select className="premium-input" style={{ height: '65px', borderRadius: '18px' }} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                <option value="dona">dona</option>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="metr">metr</option>
                <option value="pachka">pachka</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>Ombor Manzili</label>
              <select className="premium-input" style={{ height: '65px', borderRadius: '18px' }} value={newProduct.warehouse} onChange={e => setNewProduct({...newProduct, warehouse: e.target.value})}>
                <option value="Asosiy Ombor">🏢 Asosiy Ombor</option>
                <option value="Toshkent Filiali">📍 Toshkent Filiali</option>
                <option value="Samarqand Filiali">📍 Samarqand Filiali</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '2.5rem' }}>
              <button type="submit" className="btn-premium" style={{ width: '100%', height: '75px', fontSize: '1.4rem', borderRadius: '22px', boxShadow: '0 15px 35px var(--accent-gold-glow)' }}>
                <Save size={28} /> {editingProduct ? "O'ZGARIŞLARNI SAQLASH" : "OMBORGA QO'ŞISH"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3.5rem' }}>
        {[
          { label: 'Jami Mahsulotlar', value: products.length, icon: Boxes, color: 'var(--accent-blue)' },
          { label: 'Kritik Qoldiq', value: products.filter(p => p.stock <= (p.min_stock || 5)).length, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Umumiy Zaxira', value: products.reduce((acc, p) => acc + Number(p.stock), 0).toLocaleString(), icon: Package, color: 'var(--accent-gold)' },
          { label: 'Ombor Qiymati', value: products.reduce((acc, p) => acc + (Number(p.buy_price) * Number(p.stock)), 0).toLocaleString(), icon: FileText, color: 'var(--accent-emerald)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
            <div className="stat-icon-wrapper" style={{ width: '50px', height: '50px', marginBottom: '0', background: `${stat.color}15`, border: `1px solid ${stat.color}33` }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginTop: '4px' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ padding: '3rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.8px' }} className="text-gradient">Mahsulotlar Katalogi</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>Inventarizatsiya va zaxiralarni boshqarish tizimi.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
             <div style={{ position: 'relative', width: '450px' }}>
              <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
              <input className="premium-input" style={{ paddingLeft: '4.5rem', height: '65px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }} placeholder="Nomi, SKU yoki kategoriya bo'yicha qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-premium btn-ghost" style={{ height: '65px', borderRadius: '20px', gap: '0.75rem', padding: '0 1.75rem' }} onClick={handleExportCSV}>
                <FileSpreadsheet size={22} color="var(--accent-emerald)" />
                Excel
              </button>
              <button className="btn-premium btn-ghost" style={{ width: '65px', height: '65px', padding: '0', color: '#ef4444', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={async () => {
                if(window.confirm("Barcha mahsulotlarni o'chirishni tasdiqlaysizmi?")) {
                  await axios.delete(`${API_BASE_URL}/api/products/all`);
                  fetchProducts();
                  addNotification("Baza tozalandi", "success");
                }
              }}>
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '3.5rem' }}>Mahsulot Tafsiloti</th>
                <th>Kategoriya</th>
                <th>Narxlar (Sotuv/Kirim)</th>
                <th>Zaxira & Birlik</th>
                <th>Status</th>
                <th style={{ paddingRight: '3.5rem', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <td style={{ paddingLeft: '3.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Package size={22} color="var(--accent-gold)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '800', letterSpacing: '1px' }}>{p.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Tag size={16} color="var(--accent-purple)" />
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.category}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '900', color: 'var(--accent-emerald)', fontSize: '1.2rem' }}>{Number(p.sell_price).toLocaleString()} <small style={{fontSize: '0.8rem'}}>UZS</small></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '700' }}>Kirim: {Number(p.buy_price).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '900', fontSize: '1.5rem', color: '#fff' }}>{p.stock} <small style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>{p.unit || 'ta'}</small></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Warehouse size={14} /> {p.warehouse}</div>
                  </td>
                  <td>
                    {Number(p.stock) <= Number(p.min_stock || 5) ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: '900', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <AlertTriangle size={14} /> KRITIK
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: '900', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <CheckCircle2 size={14} /> NORMAL
                      </div>
                    )}
                  </td>
                  <td style={{ paddingRight: '3.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button className="btn-premium btn-ghost" style={{ width: '45px', height: '45px', padding: '0', color: 'var(--accent-gold)', borderRadius: '12px' }} onClick={() => {
                        setEditingProduct(p);
                        setNewProduct(p);
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}><Edit size={20} /></button>
                      <button className="btn-premium btn-ghost" style={{ width: '45px', height: '45px', padding: '0', color: '#ef4444', borderRadius: '12px' }} onClick={() => handleDelete(p.id)}><Trash2 size={20} /></button>
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
