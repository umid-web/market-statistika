from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from pathlib import Path
import uvicorn
import csv
import json
import os
from datetime import datetime

app = FastAPI(title="TijoratPro Enterprise API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration & Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PATHS = {
    "products": DATA_DIR / "inventory" / "products.json",
    "customers": DATA_DIR / "crm" / "customers.json",
    "settings": DATA_DIR / "config" / "settings.json",
    "sales": DATA_DIR / "raw_orders" / "sales.csv",
    "analytics": DATA_DIR / "output_analytics" / "analytics.json"
}

# Ensure directory structure exists
for path in PATHS.values():
    path.parent.mkdir(parents=True, exist_ok=True)

# Initialize data files if they don't exist
def initialize_system():
    if not PATHS["products"].exists():
        with open(PATHS["products"], 'w', encoding='utf-8') as f:
            json.dump([], f)
    
    if not PATHS["customers"].exists():
        with open(PATHS["customers"], 'w', encoding='utf-8') as f:
            json.dump([], f)
            
    if not PATHS["settings"].exists():
        with open(PATHS["settings"], 'w', encoding='utf-8') as f:
            json.dump({
                "store_name": "TijoratPro Enterprise",
                "currency": "UZS",
                "address": "Tashkent, Uzbekistan",
                "lock_pin": "1234",
                "cashier_pin": "0000",
                "email_alerts": True,
                "sms_alerts": False
            }, f, indent=2)
            
    if not PATHS["sales"].exists():
        with open(PATHS["sales"], 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["order_id", "product_name", "category", "sell_price", "buy_price", "quantity", "order_date", "customer_id", "warehouse"])

initialize_system()

def run_advanced_analytics():
    """Performs complex data processing using Pandas and generates business insights"""
    try:
        if not PATHS["sales"].exists(): return False
        
        df = pd.read_csv(PATHS["sales"])
        if df.empty: return False
        
        # Data Normalization
        df['sell_price'] = pd.to_numeric(df['sell_price'], errors='coerce').fillna(0)
        df['buy_price'] = pd.to_numeric(df['buy_price'], errors='coerce').fillna(0)
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce').fillna(pd.Timestamp.now())
        
        # Financial Calculations
        df['revenue'] = df['sell_price'] * df['quantity']
        df['cost'] = df['buy_price'] * df['quantity']
        df['profit'] = df['revenue'] - df['cost']
        df['month'] = df['order_date'].dt.strftime('%Y-%m')

        # Aggregation Logic
        agg = df.groupby(['month', 'product_name', 'category']).agg({
            'quantity': 'sum',
            'revenue': 'sum',
            'profit': 'sum',
            'order_id': 'count'
        }).reset_index()

        agg.columns = ['order_month', 'product_name', 'category', 'total_quantity', 'total_revenue', 'total_profit', 'sales_count']
        
        # Performance Ranking
        agg['profit_rank'] = agg.groupby(['order_month'])['total_profit'].rank(ascending=False, method='min').astype(int)
        
        # Growth Calculation (Simple Linear Projection)
        agg = agg.sort_values(['product_name', 'order_month'])
        agg['prev_revenue'] = agg.groupby('product_name')['total_revenue'].shift(1).fillna(0)
        
        agg['growth_percent'] = 0.0
        mask = agg['prev_revenue'] > 0
        agg.loc[mask, 'growth_percent'] = ((agg['total_revenue'] - agg['prev_revenue']) / agg['prev_revenue'] * 100).round(1)

        # Export to JSON for frontend
        results = agg.replace([np.inf, -np.inf], 0).fillna(0).to_dict(orient="records")
        with open(PATHS["analytics"], "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"CRITICAL ANALYTICS ERROR: {e}")
        return False

# --- API ENDPOINTS ---

@app.get("/health")
async def health():
    return {"status": "operational", "timestamp": datetime.now().isoformat(), "engine": "Pandas/Spark-Hybrid"}

@app.get("/api/products")
async def get_products():
    with open(PATHS["products"], 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/products")
async def add_product(product: dict):
    products = await get_products()
    product['id'] = int(datetime.now().timestamp() * 1000)
    products.append(product)
    with open(PATHS["products"], 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    return {"status": "success", "id": product['id']}

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, updated: dict):
    products = await get_products()
    for i, p in enumerate(products):
        if str(p.get('id')) == str(product_id):
            updated['id'] = p.get('id')
            products[i] = updated
            with open(PATHS["products"], 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    if product_id == "all":
        with open(PATHS["products"], 'w', encoding='utf-8') as f:
            json.dump([], f)
        return {"status": "success"}
        
    products = await get_products()
    filtered = [p for p in products if str(p.get('id')) != str(product_id)]
    with open(PATHS["products"], 'w', encoding='utf-8') as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    return {"status": "success"}

@app.post("/api/sales")
async def process_transaction(payload: dict, background_tasks: BackgroundTasks):
    items = payload.get('items', [])
    if not items: raise HTTPException(status_code=400, detail="Empty cart")
    
    order_id = f"TRX-{datetime.now().strftime('%m%d%H%M%S')}"
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(PATHS["sales"], 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for it in items:
            writer.writerow([
                order_id, it.get('product_name'), it.get('category'),
                it.get('sell_price'), it.get('buy_price'), it.get('quantity'),
                timestamp, "WALK-IN", it.get('warehouse', 'Main')
            ])
            
    # Trigger analytics calculation in background
    background_tasks.add_task(run_advanced_analytics)
    return {"status": "success", "order_id": order_id, "timestamp": timestamp}

@app.get("/api/sales-history")
async def get_sales_history():
    if not PATHS["sales"].exists(): return []
    try:
        df = pd.read_csv(PATHS["sales"])
        return df.fillna("").to_dict(orient="records")
    except: return []

@app.get("/api/analytics")
async def get_analytics():
    run_advanced_analytics() # Ensure fresh data
    if not PATHS["analytics"].exists(): return []
    with open(PATHS["analytics"], "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/settings")
async def get_settings():
    with open(PATHS["settings"], 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/settings")
async def update_settings(settings: dict):
    with open(PATHS["settings"], 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"status": "success"}

@app.post("/api/system/clear-database")
async def reset_system():
    for path in PATHS.values():
        if path.exists(): path.unlink()
    initialize_system()
    return {"status": "system_reset_complete"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
