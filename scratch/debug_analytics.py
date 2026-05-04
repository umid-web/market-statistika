import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    import pandas as pd
    import numpy as np
    from pathlib import Path
    import csv
    import json

    DATA_DIR = Path("data")
    SALES_FILE = DATA_DIR / "raw_orders" / "sales.csv"
    ANALYTICS_FILE = DATA_DIR / "output_analytics" / "analytics.json"

    # Minimal version of the task to test
    def test_task():
        if not SALES_FILE.exists(): 
            print("Sales file missing")
            return
        df = pd.read_csv(SALES_FILE)
        print(f"Rows found: {len(df)}")
        
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
            'total_profit': 'sum'
        }).reset_index()

        agg_df['profit_rank'] = 1
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
        print("Success! Result sample:")
        print(agg_df.head())

    test_task()

except Exception as e:
    print(f"Error: {e}")
