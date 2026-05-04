import pandas as pd
import numpy as np
from pathlib import Path
import csv
import json
import os

DATA_DIR = Path("backend/data") # Adjusted for running from root
SALES_FILE = DATA_DIR / "raw_orders" / "sales.csv"
ANALYTICS_FILE = DATA_DIR / "output_analytics" / "analytics.json"

def run_analytics_task():
    try:
        if not SALES_FILE.exists(): 
            print("Sales file missing")
            return False
        df = pd.read_csv(SALES_FILE)
        if df.empty or len(df) < 1: 
            print("DF empty")
            return False

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
        
        def calculate_forecast(row):
            s_curr = row['total_revenue']
            s_prev = row['prev_month_revenue']
            if s_prev <= 0 or s_curr <= 0: return s_curr
            k = np.log(s_curr / s_prev)
            forecast = s_curr * np.exp(k)
            return round(forecast, 2)

        agg_df['forecasted_revenue'] = agg_df.apply(calculate_forecast, axis=1)
        agg_df['growth_percent'] = 0.0
        mask = agg_df['prev_month_revenue'] > 0
        agg_df.loc[mask, 'growth_percent'] = ((agg_df['total_revenue'] - agg_df['prev_month_revenue']) / agg_df['prev_month_revenue'] * 100).round(1)

        results = agg_df.fillna(0).to_dict(orient="records")
        os.makedirs(ANALYTICS_FILE.parent, exist_ok=True)
        with open(ANALYTICS_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Success! Written to {ANALYTICS_FILE}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

run_analytics_task()
