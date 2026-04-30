import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  Database,
  Bell,
  User,
  Save,
  Download,
  Shield,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Settings = () => {
  const { addNotification, fetchProducts, fetchAnalytics, fetchSettings } = useStore();
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
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/settings');
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
      await axios.post('http://localhost:8000/api/settings', settings);
      addNotification("Sozlamalar muvaffaqiyatli saqlandi!", "success");
      if (fetchSettings) fetchSettings();
    } catch (err) {
      addNotification("Saqlashda xatolik", "error");
    }
  };

  const handleClearDB = async () => {
    if (!window.confirm("DIQQAT! Barcha ma'lumotlar (tovarlar, sotuvlar, mijozlar) o'chib ketadi. Rozimisiz?")) return;
    try {
      await axios.post('http://localhost:8000/api/system/clear-database');
      addNotification("Ma'lumotlar bazasi tozalandi!", "success");
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      addNotification("Tozalashda xatolik", "error");
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "v_erp_settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Yuklanmoqda...</div>;

  return (
    <div className="settings-view" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
          <SettingsIcon size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Tizim Boshqaruvi</span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>Sozlamalar</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ height: 'fit-content', padding: '1rem' }}>
          <div className={`nav-item ${activeTab === 'store' ? 'active' : ''}`} onClick={() => setActiveTab('store')}><Store size={18} /> <span>Do'kon Ma'lumotlari</span></div>
          <div className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}><DollarSign size={18} /> <span>Valyuta va Soliqlar</span></div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={18} /> <span>Profil Sozlamalari</span></div>
          <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}><Bell size={18} /> <span>Bildirishnomalar</span></div>
          <div className={`nav-item ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}><Database size={18} /> <span>Ma'lumotlar Bazasi</span></div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {activeTab === 'store' && "Do'kon Sozlamalari"}
              {activeTab === 'finance' && "Valyuta va Soliqlar"}
              {activeTab === 'profile' && "Profil Sozlamalari"}
              {activeTab === 'notifications' && "Bildirishnomalar"}
              {activeTab === 'database' && "Baza va Eksport"}
            </h3>
            <button className="btn-premium" onClick={handleSave}><Save size={18} /> Saqlash</button>
          </div>

          {activeTab === 'store' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Do'kon Nomi</label>
                <input
                  className="premium-input"
                  value={settings.store_name || ''}
                  onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Do'kon Manzili</label>
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

          {activeTab === 'finance' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="stat-item">
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Asosiy Valyuta</label>
                <select
                  className="premium-input"
                  value={settings.currency || 'UZS'}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="UZS">O'zbek so'mi (UZS)</option>
                  <option value="USD">AQSH Dollari (USD)</option>
                </select>
              </div>
              <div className="stat-item">
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>QQS Soliq Stavkalari (%)</label>
                <input
                  type="number"
                  className="premium-input"
                  value={settings.tax_rate || 0}
                  onChange={e => setSettings({ ...settings, tax_rate: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="stat-item">
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Admin Ismi</label>
                <input
                  className="premium-input"
                  value={settings.admin_name || ''}
                  onChange={e => setSettings({ ...settings, admin_name: e.target.value })}
                />
              </div>
              <div className="stat-item">
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Email Manzili</label>
                <input
                  type="email"
                  className="premium-input"
                  value={settings.admin_email || ''}
                  onChange={e => setSettings({ ...settings, admin_email: e.target.value })}
                />
              </div>
              <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Qulflash PIN kodi (Lock Screen - Admin)</label>
                <input
                  type="text"
                  className="premium-input"
                  value={settings.lock_pin || ''}
                  onChange={e => setSettings({ ...settings, lock_pin: e.target.value })}
                  placeholder="Yangi PIN kodni kiriting (Standart: 1234)..."
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={settings.email_alerts || false}
                  onChange={e => setSettings({ ...settings, email_alerts: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label className="stat-label" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => setSettings({ ...settings, email_alerts: !settings.email_alerts })}>
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
                <label className="stat-label" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => setSettings({ ...settings, sms_alerts: !settings.sms_alerts })}>
                  Omborda tovar tugaganda SMS xabar olish
                </label>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                Ma'lumotlar bazasidan zahira (backup) nusxasi olishingiz yoki to'liq tozalab yuborishingiz mumkin. Bu amalni bajarishda ehtiyot bo'ling!
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-premium btn-ghost" style={{ flex: 1 }} onClick={handleExport}>
                  <Download size={18} /> Ma'lumotlarni Yuklash (JSON)
                </button>
                <button className="btn-premium btn-ghost" style={{ flex: 1, color: '#ef4444' }} onClick={handleClearDB}>
                  <Trash2 size={18} /> Bazani Tozalash
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
