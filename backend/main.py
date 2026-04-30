from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import uvicorn
import csv
import json
import subprocess
import shutil

app = FastAPI(title="V-ERP Pro Tizimi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "V-ERP Pro Backend is running"}

# Yo'llar
DATA_DIR = Path("data")
PRODUCTS_FILE = DATA_DIR / "inventory" / "products.json"
CUSTOMERS_FILE = DATA_DIR / "crm" / "customers.json"
SETTINGS_FILE = DATA_DIR / "config" / "settings.json"
SALES_FILE = DATA_DIR / "raw_orders" / "sales.csv"
ANALYTICS_DIR = DATA_DIR / "output_analytics"

# Papkalarni yaratish
for path in [DATA_DIR / "inventory", DATA_DIR / "crm", DATA_DIR / "raw_orders", DATA_DIR / "config"]:
    path.mkdir(parents=True, exist_ok=True)

def init_json(file, default=[]):
    if not file.exists():
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(default, f, ensure_ascii=False, indent=2)

init_json(PRODUCTS_FILE)
init_json(CUSTOMERS_FILE)
default_settings = {
    "store_name": "V-ERP PRO STORE",
    "currency": "UZS",
    "address": "Toshkent sh., Chilonzor",
    "admin_name": "Admin",
    "admin_email": "admin@v-erp.com",
    "lock_pin": "1234",
    "cashier_pin": "0000",
    "email_alerts": False,
    "sms_alerts": False,
    "tax_rate": 0
}
if not SETTINGS_FILE.exists():
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(default_settings, f, ensure_ascii=False, indent=2)
else:
    # Merge: add any missing keys from default_settings without overwriting existing
    with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    merged = {**default_settings, **existing}
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

if not SALES_FILE.exists():
    with open(SALES_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["order_id", "product_name", "category", "sell_price", "buy_price", "quantity", "order_date", "customer_id", "warehouse"])

def _to_float(value, default=0.0):
    try:
        if value is None or value == "":
            return float(default)
        return float(value)
    except (TypeError, ValueError):
        return float(default)

# Settings Endpoints
@app.get("/api/settings")
async def get_settings():
    with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/settings")
async def update_settings(settings: dict):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"status": "ok"}

@app.post("/api/system/lock")
async def lock_windows_screen():
    import os
    if os.name == 'nt':
        try:
            import ctypes
            ctypes.windll.user32.LockWorkStation()
        except Exception:
            pass  # Linux/Mac serverda ishlamaydi, xato chiqarmasin
    return {"status": "locked"}

@app.post("/api/system/clear-database")
async def clear_database():
    try:
        init_json(PRODUCTS_FILE, [])
        init_json(CUSTOMERS_FILE, [])
        with open(SALES_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["order_id", "product_name", "category", "sell_price", "buy_price", "quantity", "order_date", "customer_id", "warehouse"])
        if ANALYTICS_DIR.exists():
            shutil.rmtree(ANALYTICS_DIR)
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Products Endpoints
@app.get("/api/products")
async def get_products():
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/products")
async def add_product(product: dict):
    products = await get_products()
    if any(p.get('sku') == product.get('sku') for p in products):
        raise HTTPException(status_code=400, detail="Ushbu SKU allaqachon mavjud")
    if product.get('barcode') and any(p.get('barcode') == product.get('barcode') for p in products):
        raise HTTPException(status_code=400, detail="Ushbu Shtrix-kod allaqachon mavjud")

    product['id'] = int(pd.Timestamp.now().timestamp() * 1000)
    product['stock'] = max(_to_float(product.get('stock', 0)), 0.0)
    product['buy_price'] = max(_to_float(product.get('buy_price', 0)), 0.0)
    product['sell_price'] = max(_to_float(product.get('sell_price', 0)), 0.0)
    product['min_stock'] = max(_to_float(product.get('min_stock', 5)), 0.0)
    if product['sell_price'] < product['buy_price']:
        raise HTTPException(status_code=400, detail="Sotish narxi sotib olish narxidan kichik bo'lishi mumkin emas")
    products.append(product)
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    return {"status": "ok", "product": product}

@app.get("/api/products/barcode/{barcode}")
async def get_product_by_barcode(barcode: str):
    products = await get_products()
    for p in products:
        if p.get('barcode') == barcode:
            return p
    raise HTTPException(status_code=404, detail="Barcode bilan maxsulot topilmadi")

@app.put("/api/products/{product_id}")
async def update_product(product_id: int, updated_data: dict):
    products = await get_products()
    for i, p in enumerate(products):
        if p['id'] == product_id:
            if 'stock' in updated_data:
                updated_data['stock'] = max(_to_float(updated_data.get('stock')), 0.0)
            if 'buy_price' in updated_data:
                updated_data['buy_price'] = max(_to_float(updated_data.get('buy_price')), 0.0)
            if 'sell_price' in updated_data:
                updated_data['sell_price'] = max(_to_float(updated_data.get('sell_price')), 0.0)
            if 'min_stock' in updated_data:
                updated_data['min_stock'] = max(_to_float(updated_data.get('min_stock')), 0.0)
            next_buy = updated_data.get('buy_price', p.get('buy_price', 0))
            next_sell = updated_data.get('sell_price', p.get('sell_price', 0))
            if _to_float(next_sell) < _to_float(next_buy):
                raise HTTPException(status_code=400, detail="Sotish narxi sotib olish narxidan kichik bo'lishi mumkin emas")
            products[i].update(updated_data)
            with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Maxsulot topilmadi")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    products = await get_products()
    new_products = [p for p in products if p['id'] != product_id]
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(new_products, f, ensure_ascii=False, indent=2)
    return {"status": "ok"}

@app.delete("/api/products/all")
async def delete_all_products():
    init_json(PRODUCTS_FILE, [])
    return {"status": "ok"}

@app.get("/api/customers")
async def get_customers():
    with open(CUSTOMERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/customers")
async def add_customer(customer: dict):
    customers = await get_customers()
    if any(c.get('phone') == customer.get('phone') for c in customers if c.get('phone')):
        raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon mavjud")
    customer['id'] = int(pd.Timestamp.now().timestamp() * 1000)
    customers.append(customer)
    with open(CUSTOMERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(customers, f, ensure_ascii=False, indent=2)
    return {"status": "ok", "customer": customer}

def run_analytics_task():
    """Tahlillarni Pandas orqali bevosita backend ichida hisoblash"""
    try:
        if not SALES_FILE.exists():
            return False
            
        df = pd.read_csv(SALES_FILE)
        if df.empty or len(df) < 1:
            return False

        # Ma'lumotlarni tozalash
        df['sell_price'] = pd.to_numeric(df['sell_price'], errors='coerce').fillna(0)
        df['buy_price'] = pd.to_numeric(df['buy_price'], errors='coerce').fillna(0)
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
        
        # Hisob-kitob
        df['total_revenue'] = df['sell_price'] * df['quantity']
        df['total_cost'] = df['buy_price'] * df['quantity']
        df['total_profit'] = df['total_revenue'] - df['total_cost']
        df['order_month'] = df['order_date'].dt.strftime('%Y-%m')

        # Agregatsiya
        agg_df = df.groupby(['order_month', 'product_name', 'category']).agg({
            'quantity': 'sum',
            'total_revenue': 'sum',
            'total_profit': 'sum',
            'order_id': 'count'
        }).reset_index()

        agg_df.columns = ['order_month', 'product_name', 'category', 'total_quantity', 'total_revenue', 'total_profit', 'sales_count']

        # Reytinglar
        agg_df['profit_rank'] = agg_df.groupby(['order_month', 'category'])['total_profit'].rank(ascending=False, method='min')
        
        # O'sish dinamikasi
        agg_df = agg_df.sort_values(['product_name', 'order_month'])
        agg_df['prev_month_revenue'] = agg_df.groupby('product_name')['total_revenue'].shift(1)
        agg_df['growth_percent'] = ((agg_df['total_revenue'] - agg_df['prev_month_revenue']) / agg_df['prev_month_revenue'] * 100).fillna(0).round(1)

        # JSON va Parquet ko'rinishida saqlash (Maksimal moslashuvchanlik uchun)
        ANALYTICS_DIR.mkdir(parents=True, exist_ok=True)
        results = agg_df.to_dict(orient="records")
        with open(ANALYTICS_DIR / "analytics.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        # Parquet (eski UI uchun)
        agg_df.to_parquet(ANALYTICS_DIR / "part-0000.parquet", index=False)
        return True
    except Exception as e:
        print(f"Analytics error: {e}")
        return False

@app.post("/api/sales")
async def add_sale(payload: dict):
    sales = payload.get('items', [payload])
    order_id = f"SOT-{pd.Timestamp.now().strftime('%d%H%M%S')}"
    try:
        products = await get_products()
        products_by_id = {int(p.get('id')): p for p in products if p.get('id') is not None}
        products_by_sku = {str(p.get('sku')): p for p in products if p.get('sku')}
        products_by_name = {str(p.get('name', '')).strip().lower(): p for p in products}

        prepared_rows = []
        with open(SALES_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            for item in sales:
                qty = _to_float(item.get('quantity', 0))
                if qty <= 0: continue

                matched = None
                if item.get('product_id'): matched = products_by_id.get(int(item.get('product_id')))
                if not matched and item.get('sku'): matched = products_by_sku.get(str(item.get('sku')))
                if not matched: matched = products_by_name.get(str(item.get('product_name', '')).strip().lower())
                
                if not matched: continue

                current_stock = _to_float(matched.get('stock', 0))
                sell_price = _to_float(item.get('sell_price', matched.get('sell_price', 0)))
                buy_price = _to_float(item.get('buy_price', matched.get('buy_price', 0)))

                matched['stock'] = max(0, current_stock - qty)
                prepared_rows.append([
                    order_id,
                    matched.get('name'),
                    matched.get('category'),
                    sell_price,
                    buy_price,
                    qty,
                    pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
                    item.get('customer_id', 'MEHMON'),
                    item.get('warehouse', matched.get('warehouse', 'Asosiy Ombor'))
                ])

            for row in prepared_rows:
                writer.writerow(row)
        
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
            
        # Tahlilni yangilash
        run_analytics_task()
        
        return {"status": "ok", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sales-history")
async def get_sales_history():
    if not SALES_FILE.exists(): return []
    try:
        df = pd.read_csv(SALES_FILE)
        return df.fillna("").to_dict(orient="records")
    except Exception as e: 
        return []

@app.get("/api/analytics")
async def get_analytics():
    # Agar tahlil hali yo'q bo'lsa, uni yaratishga harakat qilamiz
    if not ANALYTICS_DIR.exists() or not any(ANALYTICS_DIR.iterdir()):
        run_analytics_task()
        
    if not ANALYTICS_DIR.exists() or not any(ANALYTICS_DIR.iterdir()):
        return []

    try:
        df = pd.read_parquet(ANALYTICS_DIR)
        return df.fillna(0).to_dict(orient="records")
    except Exception as e: 
        return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
