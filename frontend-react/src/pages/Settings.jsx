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
  EyeOff
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
  <div onClick={onChange} style={{ cursor: 'pointer', userSelect: 'none' }}>
    {checked
      ? <ToggleRight size={36} color="var(--accent-emerald)" />
      : <ToggleLeft size={36} color="var(--text-muted)" />
    }
  </div>
);

const FieldGroup = ({ label, hint, children }) => (
  <div style={{ marginBottom: '0.25rem' }}>
    <label style={{
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: 'var(--text-muted)',
      marginBottom: '0.75rem'
    }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>{hint}</p>}
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1.5rem' }}>
      <Cpu size={48} className="animate-spin" style={{ color: 'var(--accent-gold)', opacity: 0.5 }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>Sozlamalar yuklanmoqda...</span>
    </div>
  );

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'var(--transition)',
  };

  return (
    <div className="fadeIn" style={{ paddingBottom: '4rem' }}>

      {/* ── Premium Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="ai-status-pulse" style={{ background: 'var(--accent-gold)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>System Configuration</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>Tizim Sozlamalari</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>TijoratPro platformasini sozlash, xavfsizlik va tizim boshqaruvi.</p>
        </div>
        <button
          className="btn-premium"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '1rem 2.5rem', fontSize: '1rem', minWidth: '180px' }}
        >
          {saved
            ? <><CheckCircle2 size={20} style={{ marginRight: '0.75rem' }} /> Saqlandi!</>
            : saving
              ? <><Cpu size={20} className="animate-spin" style={{ marginRight: '0.75rem' }} /> Saqlanmoqda...</>
              : <><Save size={20} style={{ marginRight: '0.75rem' }} /> Saqlash</>
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>

        {/* ── Sidebar Navigation ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'sticky', top: '2rem' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.1rem 1.5rem',
                  borderRadius: '18px',
                  border: isActive ? `1px solid ${tab.color}33` : '1px solid var(--glass-border)',
                  background: isActive ? `${tab.color}15` : 'rgba(255,255,255,0.02)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  width: '100%',
                  textAlign: 'left',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isActive ? `0 4px 20px ${tab.color}22` : 'none'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isActive ? `${tab.color}25` : 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={18} color={isActive ? tab.color : 'var(--text-muted)'} />
                </div>
                {tab.label}
                {isActive && <ChevronRight size={16} color={tab.color} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}

          {/* System Status Card */}
          <div className="glass-card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.25rem' }}>Tizim Holati</div>
            {[
              { icon: Server, label: 'Backend API', status: 'Online', color: 'var(--accent-emerald)' },
              { icon: HardDrive, label: 'Ma\'lumotlar Bazasi', status: 'Faol', color: 'var(--accent-emerald)' },
              { icon: Activity, label: 'Analytics Engine', status: 'Spark', color: 'var(--accent-gold)' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: i < 2 ? '1rem' : 0 }}>
                  <Icon size={16} color={item.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>{item.label}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: item.color, background: `${item.color}15`, padding: '2px 8px', borderRadius: '6px' }}>{item.status}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Content Panel ── */}
        <div>
          {/* ── GENERAL TAB ── */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--accent-gold-soft)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={22} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Do'kon Ma'lumotlari</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Biznesingiz haqidagi asosiy ma'lumotlar</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FieldGroup label="Do'kon Nomi" hint="Bu nom chek va hisobotlarda ko'rinadi.">
                      <input type="text" style={inputStyle} value={settings.store_name || ''} onChange={e => setSettings({ ...settings, store_name: e.target.value })} placeholder="Masalan: TijoratPro Savdo Markazi" />
                    </FieldGroup>
                  </div>
                  <div>
                    <FieldGroup label="Valyuta">
                      <select style={inputStyle} value={settings.currency || 'UZS'} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                        <option value="UZS">O'zbek so'mi (UZS)</option>
                        <option value="USD">AQSH Dollari (USD)</option>
                      </select>
                    </FieldGroup>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FieldGroup label="Do'kon Manzili">
                      <textarea style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} placeholder="Toshkent sh., Chilonzor tumani..." />
                    </FieldGroup>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(139,92,246,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="var(--accent-purple)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Admin Profili</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tizim administratori ma'lumotlari</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                  <div>
                    <FieldGroup label="Admin Ismi">
                      <input type="text" style={inputStyle} value={settings.admin_name || ''} onChange={e => setSettings({ ...settings, admin_name: e.target.value })} />
                    </FieldGroup>
                  </div>
                  <div>
                    <FieldGroup label="Admin Email">
                      <input type="email" style={inputStyle} value={settings.admin_email || ''} onChange={e => setSettings({ ...settings, admin_email: e.target.value })} />
                    </FieldGroup>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--accent-gold-soft)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={22} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>PIN Kodlar</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kirish va kassir nazorat kodlari</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                  <div>
                    <FieldGroup label="Admin PIN Kodi" hint="Lock ekrani va bosh admin uchun. Minimal 4 raqam.">
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', zIndex: 1 }} />
                        <input
                          type={showAdminPin ? 'text' : 'password'}
                          style={{ ...inputStyle, paddingLeft: '3rem', paddingRight: '3rem', border: '1px solid var(--accent-gold-glow)', letterSpacing: showAdminPin ? '2px' : '4px', fontSize: '1.2rem' }}
                          value={settings.lock_pin || ''}
                          onChange={e => setSettings({ ...settings, lock_pin: e.target.value })}
                          placeholder="••••"
                          maxLength={12}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPin(v => !v)}
                          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                        >
                          {showAdminPin ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FieldGroup>
                  </div>
                  <div>
                    <FieldGroup label="Kassir PIN Kodi" hint="Faqat kassa moduliga kirish uchun ishlatiladi.">
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-emerald)', zIndex: 1 }} />
                        <input
                          type={showCashierPin ? 'text' : 'password'}
                          style={{ ...inputStyle, paddingLeft: '3rem', paddingRight: '3rem', border: '1px solid rgba(16,185,129,0.3)', letterSpacing: showCashierPin ? '2px' : '4px', fontSize: '1.2rem' }}
                          value={settings.cashier_pin || ''}
                          onChange={e => setSettings({ ...settings, cashier_pin: e.target.value })}
                          placeholder="••••"
                          maxLength={12}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCashierPin(v => !v)}
                          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                        >
                          {showCashierPin ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FieldGroup>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(59,130,246,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={22} color="var(--accent-blue)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Bildirishnoma Sozlamalari</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qanday hodisalar haqida xabar olishni tanlang</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { key: 'email_alerts', label: 'Email Hisobotlari', desc: "Har kuni soat 09:00 da kunlik savdo hisoboti email'ga yuboriladi.", color: 'var(--accent-blue)' },
                  { key: 'sms_alerts', label: 'SMS Ogohlantirishlari', desc: "Omborda mahsulot tugay qolganida mobil telefonga SMS xabar yuboriladi.", color: 'var(--accent-emerald)' },
                ].map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      padding: '1.5rem 1.75rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      transition: 'var(--transition)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <CircleDot size={20} color={item.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{item.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>{item.desc}</div>
                      </div>
                    </div>
                    <ToggleSwitch checked={settings[item.key]} onChange={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SYSTEM TAB ── */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={22} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Tizim Ma'lumotlari</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Joriy platforma versiyasi va texnik ma'lumotlar</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Platforma', value: 'TijoratPro v2.0' },
                    { label: 'Frontend', value: 'React 18 + Vite' },
                    { label: 'Backend', value: 'FastAPI + Pandas' },
                    { label: 'Analytics', value: 'Apache Spark' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>{item.label}</div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(239,68,68,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={22} color="#ef4444" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ef4444' }}>Xavfli Hudud</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bu amalni ortga qaytarib bo'lmaydi. Ehtiyot bo'ling!</p>
                  </div>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.15)', marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                    Barcha <strong style={{ color: '#fff' }}>mahsulotlar</strong>, <strong style={{ color: '#fff' }}>sotuvlar tarixi</strong>, <strong style={{ color: '#fff' }}>mijozlar</strong> va <strong style={{ color: '#fff' }}>tahlillar</strong> butunlay o'chirib tashlanadi.
                    Bu amal qaytarilmas.
                  </p>
                </div>
                <button
                  onClick={handleClearDatabase}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 2rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: '14px',
                    color: '#ef4444',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                  <Trash2 size={20} />
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
