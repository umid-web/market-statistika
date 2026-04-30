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
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="inventory-module" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4af37', marginBottom: '0.5rem' }}>
            <Boxes size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Logistika Boshqaruvi</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>Ombor va Zaxiralar</h2>
        </div>
        <button className="btn-premium" onClick={() => {
          if (showAddForm) {
            setEditingProduct(null);
            setNewProduct({ name: '', sku: '', category: 'Elektronika', brand: '', buy_price: '', sell_price: '', warehouse: 'Asosiy Ombor', stock: '', min_stock: '5', barcode: '', unit: 'dona' });
          }
          setShowAddForm(!showAddForm);
        }}>
          <Plus size={20} /> {showAddForm ? "Yopish" : "Yangi Maxsulot"}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '3rem', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Zap size={24} color="#d4af37" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {editingProduct ? "Tovarni Tahrirlash" : "Tovar ma'lumotlarini kiritish"}
            </h3>
          </div>
          
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Maxsulot Nomi</label>
              <input className="premium-input" placeholder="Masalan: iPhone 15 Pro" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            </div>
            
            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>SKU / Artikul</label>
              <input className="premium-input" placeholder="INV-001" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Kategoriya</label>
              <select className="premium-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="Elektronika">Elektronika</option>
                <option value="Kiyim-kechak">Kiyim-kechak</option>
                <option value="Maishiy texnika">Maishiy texnika</option>
                <option value="Oziq-ovqat">Oziq-ovqat</option>
              </select>
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>O'lchov Birligi</label>
              <select className="premium-input" value={newProduct.unit || 'dona'} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                <option value="dona">Dona / Ta</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="litr">Litr (L)</option>
                <option value="metr">Metr (m)</option>
                <option value="quti">Quti / Pachka</option>
              </select>
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Ombor Manzili</label>
              <select className="premium-input" value={newProduct.warehouse} onChange={e => setNewProduct({...newProduct, warehouse: e.target.value})}>
                <option value="Asosiy Ombor">Asosiy Ombor</option>
                <option value="2-Filial Ombori">2-Filial Ombori</option>
                <option value="Do'kon Peshtaxtasi">Do'kon Peshtaxtasi</option>
              </select>
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Sotib olish narxi</label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input type="number" step="any" className="premium-input" value={newProduct.buy_price} onChange={e => setNewProduct({...newProduct, buy_price: e.target.value})} required />
              </div>
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Sotish narxi</label>
              <input type="number" step="any" className="premium-input" value={newProduct.sell_price} onChange={e => setNewProduct({...newProduct, sell_price: e.target.value})} required />
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                {newProduct.unit === 'litr' ? 'Umumiy Hajmi (Necha Litr?)' : 
                 newProduct.unit === 'kg' ? 'Umumiy Vazni (Necha kg?)' : 
                 newProduct.unit === 'metr' ? 'Umumiy Uzunligi (Necha metr?)' : 
                 newProduct.unit === 'quti' ? 'Necha Quti/Pachka?' : 'Dastlabki Miqdor (Dona)'}
              </label>
              <input type="number" step="any" className="premium-input" placeholder={newProduct.unit === 'dona' ? '100' : 'Masalan: 1.5'} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
            </div>

            <div className="stat-item">
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Shtrix-kod (Barcode)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="premium-input" placeholder="Skanerlang yoki kiriting..." value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} />
                <button type="button" className="btn-premium btn-ghost" onClick={() => setNewProduct({...newProduct, barcode: Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')})}>
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-premium" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={20} /> {editingProduct ? "Yangilash" : "Tovarni Omborga Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h3>Barcha Maxsulotlar</h3>
            <button className="btn-premium btn-ghost" style={{ padding: '0.4rem 0.8rem', color: '#ef4444', fontSize: '0.8rem' }} onClick={handleDeleteAll}>
              <Trash2 size={14} /> Barchasini O'chirish
            </button>
          </div>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input className="premium-input" style={{ paddingLeft: '3rem' }} placeholder="Nomi yoki SKU bo'yicha qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Tovar / SKU</th>
                <th>Kategoriya</th>
                <th>Ombor</th>
                <th>Narxi</th>
                <th>Zaxira</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {p.sku || 'N/A'}</div>
                  </td>
                  <td>
                    <span style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {p.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Warehouse size={14} color="#666" /> {p.warehouse}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700', color: 'white' }}>
                    {parseInt(p.sell_price).toLocaleString()} <small>so'm</small>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.stock} <small style={{fontSize: '0.7rem', color: '#666'}}>{p.unit || 'ta'}</small></div>
                  </td>
                  <td>
                    {p.stock <= (p.min_stock || 5) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700' }}>
                        <AlertTriangle size={14} /> Kam Qolgan
                      </div>
                    ) : (
                      <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>Etarli</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.5rem' }} onClick={() => {
                        setEditingProduct(p);
                        setNewProduct(p);
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}><Edit size={16} /></button>
                      <button className="btn-premium btn-ghost" style={{ padding: '0.5rem', color: '#ef4444' }} onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
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
