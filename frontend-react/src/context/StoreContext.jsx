import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const StoreContext = createContext();

// Backend manzili: Vercel-da bo'lganda haqiqiy Railway URL, lokalda esa nisbiy yo'l
import { API_BASE_URL } from '../api';


export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Admin', role: 'admin' });
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      addNotification("Mahsulotlarni yuklashda xatolik!", "error");
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics`);
      if (Array.isArray(res.data)) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setAnalytics([]); // Error bo'lganda bo'sh massiv qaytaramiz
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sales-history`);
      setSalesHistory(res.data);
    } catch (err) {
      addNotification("Savdo tarixini yuklashda xatolik!", "error");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/settings`);
      setSettings(res.data);
    } catch (err) {
      addNotification("Sozlamalarni yuklashda xatolik!", "error");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchAnalytics(), fetchSalesHistory(), fetchSettings()])
      .finally(() => setLoading(false));
  }, []);

  const addNotification = (text, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const addToCart = (product) => {
    const stock = Number(product.stock || 0);
    if (stock <= 0) {
      addNotification(`Bu tovar qolmagan!`, "error");
      return;
    }
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        const nextQty = Number(exists.quantity) + 1;
        if (nextQty > stock) {
          addNotification(`Omborda yetarli qoldiq yo'q!`, "error");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const updateCartQuantity = (id, quantity) => {
    const newQty = parseFloat(quantity) || 0;
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const stock = Number(item.stock || 0);
          if (newQty > stock) {
            addNotification(`Omborda faqat ${stock} ${item.unit || 'ta'} qolgan!`, "error");
            return { ...item, quantity: stock };
          }
          if (newQty <= 0) return null; // We will filter these out
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  return (
    <StoreContext.Provider value={{
      user, setUser, products, analytics, salesHistory, cart, notifications, loading, settings,
      fetchProducts, fetchAnalytics, fetchSalesHistory, fetchSettings, addNotification, addToCart, removeFromCart, clearCart, updateCartQuantity,
      setLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
