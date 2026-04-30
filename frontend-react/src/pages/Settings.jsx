import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  Bell,
  Database,
  Trash2,
  Activity,
  User,
  DollarSign,
  Store
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { API_BASE_URL } from '../api';

const Settings = () => {
  const { addNotification, fetchProducts, fetchAnalytics, fetchSettings: refreshGlobalSettings } = useStore();
  const [settings, setSettings] = useState({
    store_name: '',
    currency: 'UZS',
    address: '',
    admin_name: 'Admin',
    admin_email: 'admin@v-erp.com',
    lock_pin: '1234',
    cashier_pin: '0000',
    email_alerts: true,
    sms_alerts: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`);
        setSettings(res.data);
      } catch (err) {
        addNotification("Sozlamalarni yuklab bo'lmadi", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.post(`${API_BASE_URL}/api/settings`, settings);
      addNotification("Sozlamalar muvaffaqiyatli saqlandi!", "success");
      if (refreshGlobalSettings) refreshGlobalSettings();
    } catch (err) {
      addNotification("Saqlashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm("DIQQAT! Barcha ma'lumotlar (tovarlar, sotuvlar, mijozlar) o'chib ketadi. Rozimisiz?")) return;
    try {
      setSaving(true);
      await axios.post(`${API_BASE_URL}/api/system/clear-database`);
      addNotification("Ma'lumotlar bazasi tozalandi!", "success");
      fetchProducts();
      fetchAnalytics();
      window.location.reload();
    } catch (err) {
      addNotification("Tozalashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#d4af37' }}>Yuklanmoqda...</div>;

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient-gold" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              Tizim Sozlamalari
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>V-ERP Pro platformasini boshqarish va xavfsizlik</p>
          </div>
          <button className="btn-premium" onClick={handleSave} disabled={saving}>
            <Save size={20} style={{ marginRight: '0.75rem' }} />
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '1rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <Store size={18} /> Umumiy
            </button>
            <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={18} /> Xavfsizlik
            </button>
            <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} /> Bildirishnomalar
            </button>
            <button className={`nav-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
              <Database size={18} /> Tizim
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {activeTab === 'general' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label">Do'kon Nomi</label>
                <input
                  type="text"
                  className="premium-input"
                  value={settings.store_name || ''}
                  onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div className="stat-item">
                <label className="stat-label">Valyuta</label>
                <select
                  className="premium-input"
                  value={settings.currency || 'UZS'}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="UZS">O'zbek so'mi (UZS)</option>
                  <option value="USD">AQSH Dollari (USD)</option>
                </select>
              </div>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label">Manzil</label>
                <textarea
                  className="premium-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={settings.address || ''}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Toshkent sh., Chilonzor..."
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="stat-item">
                <label className="stat-label">Admin Ismi</label>
                <input
                  type="text"
                  className="premium-input"
                  value={settings.admin_name || ''}
                  onChange={e => setSettings({ ...settings, admin_name: e.target.value })}
                />
              </div>
              <div className="stat-item">
                <label className="stat-label">Admin Email</label>
                <input
                  type="email"
                  className="premium-input"
                  value={settings.admin_email || ''}
                  onChange={e => setSettings({ ...settings, admin_email: e.target.value })}
                />
              </div>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block', color: '#d4af37' }}>Asosiy PIN kod (Lock Screen & Admin uchun)</label>
                <input
                  type="text"
                  className="premium-input"
                  value={settings.lock_pin || ''}
                  onChange={e => setSettings({ ...settings, lock_pin: e.target.value })}
                  placeholder="PIN kod (standart: 1234)..."
                  maxLength={12}
                />
              </div>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block', color: '#10b981' }}>Kassir PIN kodi (Faqat Kassa uchun)</label>
                <input
                  type="text"
                  className="premium-input"
                  value={settings.cashier_pin || ''}
                  onChange={e => setSettings({ ...settings, cashier_pin: e.target.value })}
                  placeholder="Kassir kodi (standart: 0000)..."
                  maxLength={12}
                  style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={settings.email_alerts || false}
                  onChange={e => setSettings({ ...settings, email_alerts: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label className="stat-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Email orqali kunlik xisobotlarni olish
                </label>
              </div>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={settings.sms_alerts || false}
                  onChange={e => setSettings({ ...settings, sms_alerts: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label className="stat-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Omborda tovar tugaganda SMS xabar olish
                </label>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="stat-item">
                <h3 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={20} /> Xavfli Hudud
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Barcha mahsulotlar, sotuvlar va tahlillarni butunlay o'chirib tashlash. Bu amalni ortga qaytarib bo'lmaydi.
                </p>
                <button className="btn-premium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }} onClick={handleClearDatabase} disabled={saving}>
                  <Database size={18} style={{ marginRight: '0.75rem' }} />
                  Ma'lumotlar Bazasini Tozalash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
