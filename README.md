# 📊 Market Statistika — Big Data Analytics Platform

> **Hadoop + Apache Spark + React** yordamida qurilgan professional savdo bozori tahlil platformasi (V-ERP Pro).

![Platform Preview](https://img.shields.io/badge/Stack-Hadoop%20%7C%20Spark%20%7C%20React-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10%2B-yellow?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 Loyiha Haqida

**Market Statistika** — bu real vaqtda savdo ma'lumotlarini qayta ishlash va vizualizatsiya qilish uchun mo'ljallangan to'liq stack Big Data platformasi. Backend qismida Apache Spark yordamida CSV ma'lumotlar tahlil qilinib, natijalar Parquet formatida saqlanadi va React frontend orqali foydalanuvchilarga chiroyli dashboard ko'rinishida taqdim etiladi.

---

## 🏗️ Arxitektura

```
┌─────────────────────────────────────────────────────────┐
│                    Market Statistika                     │
├───────────────┬─────────────────┬───────────────────────┤
│   Data Layer  │  Processing     │   Presentation        │
│   (CSV/HDFS)  │  (PySpark)      │   (React + FastAPI)   │
│               │                 │                       │
│  sales.csv ──►│ Spark Job ────► │ Dashboard (Charts)    │
│  orders.csv   │ KPI Calc        │ Admin Panel           │
│               │ Parquet Output  │ POS System            │
└───────────────┴─────────────────┴───────────────────────┘
```

---

## 📁 Loyiha Strukturasi

```
market-statistika/
├── 📂 src/                         # PySpark job skriptlari
│   ├── bigdata_hadoop_spark_job.py # Asosiy Spark analytics job
│   └── generate_sample_data.py     # Test CSV ma'lumot generatori
│
├── 📂 backend/                     # FastAPI REST backend
│   └── main.py                     # API endpoints
│
├── 📂 frontend-react/              # React.js frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin.jsx           # Admin boshqaruv paneli
│   │   │   ├── Analytics.jsx       # Tahlil sahifasi (Charts)
│   │   │   ├── POS.jsx             # Savdo nuqtasi
│   │   │   └── Settings.jsx        # Sozlamalar
│   │   └── components/
│   │       ├── Sidebar.jsx         # Yon panel navigatsiya
│   │       ├── Header.jsx          # Sarlavha komponenti
│   │       ├── Charts.jsx          # Recharts vizualizatsiya
│   │       └── DataTable.jsx       # Ma'lumotlar jadvali
│
├── 📂 data/raw_orders/             # Namuna CSV ma'lumotlar
│   └── sales.csv
│
├── 📂 hadoop/                      # Hadoop konfiguratsiyasi
│
├── requirements.txt                # Python paketlari
├── package.json                    # Node.js paketlari
├── run_project.ps1                 # 1-click ishga tushirish (PowerShell)
└── run_web.ps1                     # Web server ishga tushirish
```

---

## ⚡ Asosiy Funktsiyalar

### 🔢 Big Data Processing (PySpark)
| Funksiya | Tavsif |
|----------|--------|
| **Data Ingestion** | HDFS yoki lokal CSV fayllardan ma'lumot o'qish |
| **Data Cleaning** | Null va manfiy qiymatlarni filtrlash, tip to'g'rilash |
| **KPI Calculation** | Buyurtmalar, mijozlar, daromad, o'rtacha qiymat |
| **Advanced Analytics** | `dense_rank` — oylik daromad reytingi (davlatlar bo'yicha) |
| **Efficient Storage** | Parquet formatida partition qilib saqlash |

### 🖥️ Frontend (React + Recharts)
- 📈 **Analytics Dashboard** — interaktiv grafiklar va KPI kartalar
- 🛒 **POS System** — savdo nuqtasi interfeysi
- 👤 **Admin Panel** — foydalanuvchi va buyurtma boshqaruvi
- 🔐 **RBAC System** — Admin / Cashier rol asosida kirish nazorati
- ⚙️ **Settings** — PIN kodlar va tizim sozlamalari

---

## 🛠️ Texnologiyalar

| Qatlam | Texnologiya |
|--------|------------|
| **Big Data** | Apache Spark (PySpark), Hadoop HDFS |
| **Backend** | Python 3.10+, FastAPI, Pandas |
| **Frontend** | React 18, Recharts, Lucide Icons |
| **Storage** | Apache Parquet, CSV |
| **Scripting** | PowerShell |

---

## 🚀 Ishga Tushirish

### Talablar
- Python 3.10+
- Java 11+ (Spark uchun)
- Node.js 18+
- Git

### 1-Qadam: Loyihani klonlash
```bash
git clone https://github.com/umid-web/market-statistika.git
cd market-statistika
```

### 2-Qadam: To'liq loyihani avtomatik ishga tushirish
```powershell
.\run_project.ps1
```
> Bu skript: virtual muhit yaratadi → paketlarni o'rnatadi → test ma'lumot generatsiya qiladi → Spark job ishga tushiradi.

### 3-Qadam: Web interfeysni ishga tushirish
```powershell
.\run_web.ps1
```
> Backend (FastAPI) va Frontend (React) serverlarni bir vaqtda ishga tushiradi.

### Qo'lda ishga tushirish
```bash
# Python virtual muhit
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Ma'lumot generatsiya
python src/generate_sample_data.py

# Spark job
python src/bigdata_hadoop_spark_job.py

# Frontend
cd frontend-react
npm install
npm run dev
```

### Hadoop/YARN klasterda ishga tushirish
```bash
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  src/bigdata_hadoop_spark_job.py \
  --input-path hdfs:///data/orders/*.csv \
  --output-path hdfs:///analytics/orders_kpi \
  --checkpoint-path hdfs:///tmp/spark_checkpoints/orders_kpi
```

---

## 🔐 Kirish Tizimi (RBAC)

Tizimga kirish uchun PIN kod talab qilinadi:

| Rol | Kirish Huquqlari |
|-----|-----------------|
| **Admin** | Barcha modullar (Analytics, Admin, POS, Settings) |
| **Cashier** | Faqat POS moduli |

> PIN kodlar Settings sahifasidan o'zgartirilishi mumkin.

---

## 📜 Litsenziya

[MIT License](LICENSE) — erkin foydalaning, fork qiling, takomillashtiring!

---

<div align="center">
  <b>⭐ Agar loyiha foydali bo'lsa, star bosing!</b><br>
  Made with ❤️ using Hadoop, Spark & React
</div>
