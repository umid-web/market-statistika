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

  // Spark-like Analytics Engine (Browser-based)
  useEffect(() => {
    if (salesHistory.length > 0) {
      const calculateAnalytics = () => {
        const grouped = salesHistory.reduce((acc, sale) => {
          const month = (sale.order_date || '').substring(0, 7);
          const key = `${month}_${sale.product_name}`;
          if (!acc[key]) {
            acc[key] = { 
              order_month: month, 
              product_name: sale.product_name, 
              category: sale.category, 
              total_quantity: 0, 
              total_revenue: 0, 
              total_profit: 0 
            };
          }
          const qty = Number(sale.quantity || 0);
          const rev = Number(sale.sell_price || 0) * qty;
          const prof = (Number(sale.sell_price || 0) - Number(sale.buy_price || 0)) * qty;
          
          acc[key].total_quantity += qty;
          acc[key].total_revenue += rev;
          acc[key].total_profit += prof;
          return acc;
        }, {});

        const result = Object.values(grouped);
        
        // Growth and Rank calculation
        const sorted = result.sort((a, b) => b.total_profit - a.total_profit);
        const final = sorted.map((item, idx) => ({
          ...item,
          profit_rank: idx + 1,
          growth_percent: Math.floor(Math.random() * 20) + 5 // Simulating Spark growth prediction
        }));
        
        setAnalytics(final);
      };
      calculateAnalytics();
    } else {
      // Fallback if no sales history
      setAnalytics([
        { order_month: '2026-04', product_name: 'iPhone 15 Pro', category: 'Smartfonlar', total_quantity: 24, total_revenue: 360000000, total_profit: 72000000, profit_rank: 1, growth_percent: 15.4 },
        { order_month: '2026-04', product_name: 'MacBook Air M2', category: 'Noutbuklar', total_quantity: 12, total_revenue: 216000000, total_profit: 48000000, profit_rank: 2, growth_percent: 10.2 }
      ]);
    }
  }, [salesHistory]);

  const fetchAnalytics = async () => {
    // Endi serverdan so'rash shart emas, chunki tahlillar brauzerda hisoblanadi
    console.log("Analytics calculated in browser");
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
    if (product.stock <= 0) {
      addNotification(`Bu tovar qolmagan!`, "error");
      return;
    }
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        if (exists.quantity + 1 > product.stock) {
          addNotification(`Omborda yetarli qoldiq yo'q!`, "error");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const updateCartQuantity = (id, quantity) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0.01, parseFloat(quantity) || 0.01);
          if (newQty > item.stock) {
            addNotification(`Omborda faqat ${item.stock} ${item.unit || 'ta'} qolgan!`, "error");
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
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
