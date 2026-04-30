from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import uvicorn
import csv
import json
import shutil
import os

app = FastAPI(title="V-ERP Pro System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
DATA_DIR = Path("data")
PRODUCTS_FILE = DATA_DIR / "inventory" / "products.json"
CUSTOMERS_FILE = DATA_DIR / "crm" / "customers.json"
SETTINGS_FILE = DATA_DIR / "config" / "settings.json"
SALES_FILE = DATA_DIR / "raw_orders" / "sales.csv"
ANALYTICS_FILE = DATA_DIR / "output_analytics" / "analytics.json"

# Create directories
for p in [DATA_DIR / "inventory", DATA_DIR / "crm", DATA_DIR / "raw_orders", DATA_DIR / "config", DATA_DIR / "output_analytics"]:
    p.mkdir(parents=True, exist_ok=True)

def init_json(file, default=[]):
    if not file.exists():
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(default, f, ensure_ascii=False, indent=2)

init_json(PRODUCTS_FILE)
init_json(CUSTOMERS_FILE)

if not SETTINGS_FILE.exists():
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump({"store_name": "V-ERP PRO", "currency": "UZS", "lock_pin": "1234", "cashier_pin": "0000"}, f)

if not SALES_FILE.exists():
    with open(SALES_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["order_id", "product_name", "category", "sell_price", "buy_price", "quantity", "order_date", "customer_id", "warehouse"])

def run_analytics_task():
    """Tahlillarni hisoblash (Faqat JSON ishlatiladi - 100% ishonchli)"""
    try:
        if not SALES_FILE.exists(): return False
        df = pd.read_csv(SALES_FILE)
        if df.empty or len(df) < 1: return False

        df['sell_price'] = pd.to_numeric(df['sell_price'], errors='coerce').fillna(0)
        df['buy_price'] = pd.to_numeric(df['buy_price'], errors='coerce').fillna(0)
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce').fillna(pd.Timestamp.now())
        
        df['total_revenue'] = df['sell_price'] * df['quantity']
        df['total_cost'] = df['buy_price'] * df['quantity']
        df['total_profit'] = df['total_revenue'] - df['total_cost']
        df['order_month'] = df['order_date'].dt.strftime('%Y-%m')

        agg_df = df.groupby(['order_month', 'product_name', 'category']).agg({
            'quantity': 'sum',
            'total_revenue': 'sum',
            'total_profit': 'sum',
            'order_id': 'count'
        }).reset_index()

        agg_df.columns = ['order_month', 'product_name', 'category', 'total_quantity', 'total_revenue', 'total_profit', 'sales_count']
        agg_df['profit_rank'] = agg_df.groupby(['order_month', 'category'])['total_profit'].rank(ascending=False, method='min').astype(int)
        
        agg_df = agg_df.sort_values(['product_name', 'order_month'])
        agg_df['prev_month_revenue'] = agg_df.groupby('product_name')['total_revenue'].shift(1).fillna(0)
        agg_df['growth_percent'] = 0.0
        mask = agg_df['prev_month_revenue'] > 0
        agg_df.loc[mask, 'growth_percent'] = ((agg_df['total_revenue'] - agg_df['prev_month_revenue']) / agg_df['prev_month_revenue'] * 100).round(1)

        results = agg_df.fillna(0).to_dict(orient="records")
        with open(ANALYTICS_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Analytics error: {e}")
        return False

@app.get("/")
async def root(): return {"status": "ok"}

@app.get("/api/products")
async def get_products():
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f: return json.load(f)

@app.post("/api/products")
async def add_product(product: dict):
    products = await get_products()
    product['id'] = int(pd.Timestamp.now().timestamp() * 1000)
    products.append(product)
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    return {"status": "ok"}

@app.post("/api/sales")
async def add_sale(payload: dict):
    items = payload.get('items', [])
    order_id = f"SOT-{pd.Timestamp.now().strftime('%d%H%M%S')}"
    with open(SALES_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for it in items:
            writer.writerow([
                order_id, it.get('product_name'), it.get('category'),
                it.get('sell_price'), it.get('buy_price'), it.get('quantity'),
                pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'), "MEHMON", "Asosiy Ombor"
            ])
    run_analytics_task()
    return {"status": "ok", "order_id": order_id}

@app.get("/api/sales-history")
async def get_sales_history():
    if not SALES_FILE.exists(): return []
    try:
        df = pd.read_csv(SALES_FILE)
        return df.fillna("").to_dict(orient="records")
    except: return []

@app.get("/api/analytics")
async def get_analytics():
    from fastapi.responses import JSONResponse
    
    # Har doim eng yangi ma'lumotni hisoblashga harakat qilamiz
    run_analytics_task()
    
    if not ANALYTICS_FILE.exists():
        return JSONResponse(content=[], headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

    try:
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return JSONResponse(content=data, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    except:
        return JSONResponse(content=[], headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

@app.get("/api/settings")
async def get_settings():
    with open(SETTINGS_FILE, 'r', encoding='utf-8') as f: return json.load(f)

@app.post("/api/settings")
async def update_settings(settings: dict):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"status": "ok"}

@app.post("/api/system/clear-database")
async def clear_database():
    for f in [PRODUCTS_FILE, CUSTOMERS_FILE, SALES_FILE, ANALYTICS_FILE]:
        if f.exists(): f.unlink()
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
