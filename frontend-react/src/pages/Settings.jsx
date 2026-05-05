import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Save,
  Shield,
  Bell,
  Database,
  Trash2,
  Store,
  User,
  Lock,
  KeyRound,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  HardDrive,
  Server,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Smartphone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { API_BASE_URL } from '../api';

const TABS = [
  { id: 'general', label: "Umumiy", icon: Store, color: 'var(--accent-gold)' },
  { id: 'security', label: "Xavfsizlik", icon: Shield, color: 'var(--accent-purple)' },
  { id: 'notifications', label: "Bildirishnomalar", icon: Bell, color: 'var(--accent-blue)' },
  { id: 'system', label: "Tizim", icon: Database, color: '#ef4444' },
];

const ToggleSwitch = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ cursor: 'pointer', userSelect: 'none', transition: 'var(--transition)' }}>
    {checked
      ? <ToggleRight size={40} color="var(--accent-emerald)" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }} />
      : <ToggleLeft size={40} color="var(--text-muted)" />
    }
  </div>
);

const FieldGroup = ({ label, hint, children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <label style={{
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      color: 'var(--text-muted)',
      marginBottom: '0.75rem'
    }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: '1.6', fontWeight: '500' }}>{hint}</p>}
  </div>
);

const Settings = () => {
  const { addNotification, fetchProducts, fetchAnalytics, fetchSettings: refreshGlobalSettings } = useStore();
  const [settings, setSettings] = useState({
    store_name: '',
    currency: 'UZS',
    address: '',
    admin_name: 'Admin',
    admin_email: 'admin@tijoratpro.com',
    lock_pin: '1234',
    cashier_pin: '0000',
    email_alerts: true,
    sms_alerts: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showCashierPin, setShowCashierPin] = useState(false);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '2rem' }}>
      <div className="stat-icon-wrapper animate-spin" style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold-glow)' }}>
        <Cpu size={40} color="var(--accent-gold)" />
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Configuring Environment...</span>
    </div>
  );

  return (
    <div className="settings-view fadeIn">
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-gold)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>System Configuration</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Tizim Sozlamalari</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Platforma parametrlari, xavfsizlik protokollari va tizim arxitekturasini boshqarish.</p>
        </div>
        <button
          className="btn-premium"
          onClick={handleSave}
          disabled={saving}
          style={{ height: '60px', padding: '0 3rem', fontSize: '1rem', borderRadius: '18px' }}
        >
          {saved
            ? <><CheckCircle2 size={22} /> Saqlandi!</>
            : saving
              ? <><Cpu size={22} className="animate-spin" /> Saqlanmoqda...</>
              : <><Save size={22} /> O'zgarishlarni Saqlash</>
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3.5rem', alignItems: 'start' }}>

        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'sticky', top: '2rem' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  padding: '1.25rem 1.75rem',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: isActive ? '1px solid var(--glass-border-bright)' : '1px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                }}
              >
                <Icon size={22} color={isActive ? tab.color : 'inherit'} />
                <span style={{ flex: 1 }}>{tab.label}</span>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tab.color }}></div>}
              </div>
            );
          })}

          <div className="glass-card" style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(5, 10, 15, 0.4)', borderRadius: '25px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.75rem' }}>Cluster Status</div>
            {[
              { icon: Server, label: 'Cloud Gateway', status: 'Online', color: 'var(--accent-emerald)' },
              { icon: HardDrive, label: 'PostgreSQL DB', status: 'Active', color: 'var(--accent-emerald)' },
              { icon: Activity, label: 'ML Analytics', status: 'Spark 3.5', color: 'var(--accent-gold)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: i < 2 ? '1.25rem' : 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: item.color }}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {activeTab === 'general' && (
            <div className="glass-card animate-float" style={{ padding: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--accent-gold-soft)', border: '1px solid var(--accent-gold-glow)' }}>
                  <Store size={28} color="var(--accent-gold)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>Do'kon Konfiguratsiyasi</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Biznesingizning global identifikatsiya ma'lumotlari.</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldGroup label="Do'kon Nomi" hint="Cheklar, hisobotlar va tizim sarlavhasida ko'rsatiladigan asosiy brend nomi.">
                    <div style={{ position: 'relative' }}>
                      <Globe size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                      <input type="text" className="premium-input" style={{ height: '65px', paddingLeft: '4rem' }} value={settings.store_name || ''} onChange={e => setSettings({ ...settings, store_name: e.target.value })} placeholder="Masalan: TijoratPro Savdo Markazi" />
                    </div>
                  </FieldGroup>
                </div>
                <div>
                  <FieldGroup label="Baza Valyutasi">
                    <select className="premium-input" style={{ height: '65px' }} value={settings.currency || 'UZS'} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                      <option value="UZS">O'zbek so'mi (UZS)</option>
                      <option value="USD">AQSH Dollari (USD)</option>
                    </select>
                  </FieldGroup>
                </div>
                <div>
                  <FieldGroup label="Hudud & Vaqt" hint="Tizim vaqti: GMT+5 (Tashkent)">
                    <input type="text" className="premium-input" style={{ height: '65px' }} value="Uzbekistan / Tashkent" disabled />
                  </FieldGroup>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldGroup label="Do'kon Manzili">
                    <textarea className="premium-input" style={{ minHeight: '140px', padding: '1.5rem', lineHeight: '1.6' }} value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} placeholder="Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 15-uy..." />
                  </FieldGroup>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                  <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Shield size={28} color="var(--accent-purple)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>Administrator Nazorati</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Tizimga kirish huquqlari va admin ma'lumotlari.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <FieldGroup label="Admin Ismi">
                    <div style={{ position: 'relative' }}>
                      <User size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} />
                      <input type="text" className="premium-input" style={{ height: '65px', paddingLeft: '4rem' }} value={settings.admin_name || ''} onChange={e => setSettings({ ...settings, admin_name: e.target.value })} />
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Email Manzili">
                    <div style={{ position: 'relative' }}>
                      <Mail size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} />
                      <input type="email" className="premium-input" style={{ height: '65px', paddingLeft: '4rem' }} value={settings.admin_email || ''} onChange={e => setSettings({ ...settings, admin_email: e.target.value })} />
                    </div>
                  </FieldGroup>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '3.5rem', border: '1px solid var(--accent-gold-glow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                  <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--accent-gold-soft)', border: '1px solid var(--accent-gold-glow)' }}>
                    <KeyRound size={28} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>PIN Kodlar Xavfsizligi</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Tizim blokirovkasini ochish va rol nazorati kodlari.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <FieldGroup label="Admin PIN Kodi" hint="Barcha modullarga to'liq kirish huquqini beradi.">
                    <div style={{ position: 'relative' }}>
                      <Lock size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                      <input
                        type={showAdminPin ? 'text' : 'password'}
                        className="premium-input"
                        style={{ height: '70px', paddingLeft: '4.5rem', paddingRight: '4.5rem', fontSize: '1.5rem', letterSpacing: showAdminPin ? '2px' : '8px', color: 'var(--accent-gold)' }}
                        value={settings.lock_pin || ''}
                        onChange={e => setSettings({ ...settings, lock_pin: e.target.value })}
                        placeholder="••••"
                      />
                      <button type="button" onClick={() => setShowAdminPin(!showAdminPin)} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {showAdminPin ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Kassir PIN Kodi" hint="Faqat POS (Kassa) moduliga kirish huquqini beradi.">
                    <div style={{ position: 'relative' }}>
                      <Lock size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-emerald)' }} />
                      <input
                        type={showCashierPin ? 'text' : 'password'}
                        className="premium-input"
                        style={{ height: '70px', paddingLeft: '4.5rem', paddingRight: '4.5rem', fontSize: '1.5rem', letterSpacing: showCashierPin ? '2px' : '8px', color: 'var(--accent-emerald)' }}
                        value={settings.cashier_pin || ''}
                        onChange={e => setSettings({ ...settings, cashier_pin: e.target.value })}
                        placeholder="••••"
                      />
                      <button type="button" onClick={() => setShowCashierPin(!showCashierPin)} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {showCashierPin ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </FieldGroup>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card" style={{ padding: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <Bell size={28} color="var(--accent-blue)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>Avtomat Bildirishnomalar</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Tizim hodisalari haqida masofaviy ogohlantirishlar.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { key: 'email_alerts', icon: Mail, label: 'Email Monitoring', desc: "Kunlik savdo ko'rsatkichlari va tahliliy hisobotlarni email orqali yuborish.", color: 'var(--accent-blue)' },
                  { key: 'sms_alerts', icon: Smartphone, label: 'SMS Gateway', desc: "Kritik holatlar (mahsulot tugashi, katta qaytarimlar) haqida SMS ogohlantirish.", color: 'var(--accent-emerald)' },
                ].map(item => (
                  <div
                    key={item.key}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '2rem 2.5rem',
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={20} color={item.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>{item.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{item.desc}</div>
                      </div>
                    </div>
                    <ToggleSwitch checked={settings[item.key]} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                  <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Activity size={28} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>Cluster Arxitekturasi</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Tizimning texnik komponentlari va versiyalari.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {[
                    { label: 'Platform Engine', value: 'TijoratPro Enterprise v3.0' },
                    { label: 'Runtime Environment', value: 'React 18 + Node.js 20' },
                    { label: 'Big Data Pipeline', value: 'Apache Spark + Hadoop 3.3' },
                    { label: 'Database Engine', value: 'In-Memory Pandas + Railway DB' },
                  ].map((item, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{item.label}</div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '3.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div className="stat-icon-wrapper" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle size={28} color="#ef4444" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ef4444' }}>Danger Zone</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Ushbu amallar tizim ma'lumotlarini butunlay o'chirib yuboradi.</p>
                  </div>
                </div>
                <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '2.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', fontWeight: '500' }}>
                    Ma'lumotlar bazasini tozalash natijasida barcha <strong style={{ color: '#fff' }}>mahsulotlar</strong>, <strong style={{ color: '#fff' }}>sotuvlar</strong> va <strong style={{ color: '#fff' }}>mijozlar</strong> bazasi butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
                  </p>
                </div>
                <button
                  onClick={handleClearDatabase}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 2.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    color: '#ef4444',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  <Trash2 size={22} />
                  System Factory Reset
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
