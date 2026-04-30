import argparse
import os
import pandas as pd
from pathlib import Path

def run_analytics_with_pandas(input_path, output_path):
    """Spark bo'lmagan holatda Pandas orqali tahlil qilish (Fallback)"""
    print("[INFO] Pandas orqali tahlil boshlandi...")
    try:
        # 1. Ma'lumotlarni o'qish
        df = pd.read_csv(input_path)
        if df.empty:
            print("[WARN] Sales CSV bo'sh.")
            return

        # 2. Tiplarni to'g'irlash
        df['sell_price'] = pd.to_numeric(df['sell_price'], errors='coerce').fillna(0)
        df['buy_price'] = pd.to_numeric(df['buy_price'], errors='coerce').fillna(0)
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
        
        # 3. Hisob-kitob
        df['total_revenue'] = df['sell_price'] * df['quantity']
        df['total_cost'] = df['buy_price'] * df['quantity']
        df['total_profit'] = df['total_revenue'] - df['total_cost']
        df['order_month'] = df['order_date'].dt.strftime('%Y-%m')

        # 4. Agregatsiya
        agg_df = df.groupby(['order_month', 'product_name', 'category']).agg({
            'quantity': 'sum',
            'total_revenue': 'sum',
            'total_profit': 'sum',
            'order_id': 'count'
        }).reset_index()

        agg_df.columns = ['order_month', 'product_name', 'category', 'total_quantity', 'total_revenue', 'total_profit', 'sales_count']

        # 5. Reyting va Dinamika (Window functions muqobili)
        agg_df['profit_rank'] = agg_df.groupby(['order_month', 'category'])['total_profit'].rank(ascending=False, method='min')
        
        # O'sish dinamikasi
        agg_df = agg_df.sort_values(['product_name', 'order_month'])
        agg_df['prev_month_revenue'] = agg_df.groupby('product_name')['total_revenue'].shift(1)
        agg_df['growth_percent'] = ((agg_df['total_revenue'] - agg_df['prev_month_revenue']) / agg_df['prev_month_revenue'] * 100).fillna(0)

        # 6. Saqlash (Parquet formatida)
        os.makedirs(output_path, exist_ok=True)
        agg_df.to_parquet(Path(output_path) / "analytics_results.parquet", index=False)
        print(f"[OK] Pandas Tahlil Yakunlandi. Output: {output_path}")

    except Exception as e:
        print(f"[ERROR] Pandas Tahlilda xatolik: {str(e)}")

def run_analytics_with_spark(input_path, output_path, checkpoint_path):
    """Spark orqali tahlil qilish"""
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window
    from pyspark.sql.types import DoubleType

    print("[INFO] Spark orqali tahlil boshlandi...")
    base_dir = Path(__file__).resolve().parent.parent
    hadoop_home = base_dir / "hadoop"
    if hadoop_home.exists():
        os.environ["HADOOP_HOME"] = str(hadoop_home)
        os.environ["PATH"] = str(hadoop_home / "bin") + os.pathsep + os.environ.get("PATH", "")

    spark = SparkSession.builder \
        .appName("V-ERP-Pro-Analytics") \
        .master("local[*]") \
        .config("spark.driver.memory", "1g") \
        .config("spark.sql.shuffle.partitions", "1") \
        .getOrCreate()

    try:
        df = spark.read.csv(input_path, header=True, inferSchema=False)
        df = df.withColumn("sell_price", F.col("sell_price").cast(DoubleType())) \
               .withColumn("buy_price", F.col("buy_price").cast(DoubleType())) \
               .withColumn("quantity", F.col("quantity").cast(DoubleType())) \
               .withColumn("order_date", F.to_date(F.col("order_date"), "yyyy-MM-dd"))

        df_processed = df.withColumn("total_revenue", F.col("sell_price") * F.col("quantity")) \
                         .withColumn("total_cost", F.col("buy_price") * F.col("quantity")) \
                         .withColumn("total_profit", F.col("total_revenue") - F.col("total_cost")) \
                         .withColumn("order_month", F.date_format(F.col("order_date"), "yyyy-MM"))

        agg_df = df_processed.groupBy("order_month", "product_name", "category") \
            .agg(
                F.sum("quantity").alias("total_quantity"),
                F.sum("total_revenue").alias("total_revenue"),
                F.sum("total_profit").alias("total_profit"),
                F.count("order_id").alias("sales_count")
            )

        windowSpecCategory = Window.partitionBy("order_month", "category").orderBy(F.col("total_profit").desc())
        analytics_df = agg_df.withColumn("profit_rank", F.rank().over(windowSpecCategory))

        windowSpecMonth = Window.partitionBy("product_name").orderBy("order_month")
        analytics_df = analytics_df.withColumn("prev_month_revenue", F.lag("total_revenue", 1).over(windowSpecMonth))
        analytics_df = analytics_df.withColumn("growth_percent", 
                                               F.when(F.col("prev_month_revenue").isNotNull() & (F.col("prev_month_revenue") > 0),
                                                      F.round(((F.col("total_revenue") - F.col("prev_month_revenue")) / F.col("prev_month_revenue")) * 100, 2))
                                                .otherwise(0.0))

        analytics_df.coalesce(1).write.mode("overwrite").parquet(output_path)
        print(f"[OK] Spark Tahlil Yakunlandi.")

    except Exception as e:
        print(f"[ERROR] Spark Xatolik: {str(e)}")
        raise e
    finally:
        spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-path", required=True)
    parser.add_argument("--output-path", required=True)
    parser.add_argument("--checkpoint-path", required=True)
    args, unknown = parser.parse_known_args()

    input_p = args.input_path.replace("\\", "/")
    output_p = args.output_path.replace("\\", "/")
    
    try:
        # Avval Spark-ni sinab ko'ramiz
        import pyspark
        run_analytics_with_spark(input_p, output_p, args.checkpoint_path)
    except Exception:
        # Agar Spark bo'lmasa yoki xato bersa -> Pandas
        run_analytics_with_pandas(input_p, output_p)
