import argparse
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.sql.types import DoubleType, IntegerType
import os
from pathlib import Path

def run_analytics(input_path, output_path, checkpoint_path):
    base_dir = Path(__file__).resolve().parent.parent
    hadoop_home = base_dir / "hadoop"
    if hadoop_home.exists():
        os.environ["HADOOP_HOME"] = str(hadoop_home)
        os.environ["PATH"] = str(hadoop_home / "bin") + os.pathsep + os.environ.get("PATH", "")

    spark = SparkSession.builder \
        .appName("V-ERP-Pro-Analytics") \
        .master("local[*]") \
        .config("spark.driver.memory", "2g") \
        .config("spark.sql.shuffle.partitions", "1") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    try:
        # 1. Ma'lumotlarni o'qish (CSV dan)
        # Hamma *.csv fayllarni bittada o'qiymiz
        df = spark.read.csv(input_path, header=True, inferSchema=False)
        
        # 2. Tiplarni to'g'irlash (Explicit Casting)
        # Sotuvlar ro'yxatidagi narxlarni raqamga o'tkazamiz
        df = df.withColumn("sell_price", F.col("sell_price").cast(DoubleType())) \
               .withColumn("buy_price", F.col("buy_price").cast(DoubleType())) \
               .withColumn("quantity", F.col("quantity").cast(DoubleType())) \
               .withColumn("order_date", F.to_date(F.col("order_date"), "yyyy-MM-dd"))

        # 3. Hisob-kitob
        df_processed = df.withColumn("total_revenue", F.col("sell_price") * F.col("quantity")) \
                         .withColumn("total_cost", F.col("buy_price") * F.col("quantity")) \
                         .withColumn("total_profit", F.col("total_revenue") - F.col("total_cost")) \
                         .withColumn("order_month", F.date_format(F.col("order_date"), "yyyy-MM"))

        # 4. Asosiy Agregatsiya
        agg_df = df_processed.groupBy("order_month", "product_name", "category") \
            .agg(
                F.sum("quantity").alias("total_quantity"),
                F.sum("total_revenue").alias("total_revenue"),
                F.sum("total_profit").alias("total_profit"),
                F.count("order_id").alias("sales_count")
            )

        # 4.1. Advanced Big Data Patterns: Window Functions (Rank and Lag)
        # Har bir kategoriya ichida daromad bo'yicha maxsulotlar reytingini (rank) hisoblash
        windowSpecCategory = Window.partitionBy("order_month", "category").orderBy(F.col("total_profit").desc())
        analytics_df = agg_df.withColumn("profit_rank", F.rank().over(windowSpecCategory))

        # 4.2. Oylik o'sish dinamikasini hisoblash (O'tgan oyga nisbatan)
        windowSpecMonth = Window.partitionBy("product_name").orderBy("order_month")
        analytics_df = analytics_df.withColumn("prev_month_revenue", F.lag("total_revenue", 1).over(windowSpecMonth))
        analytics_df = analytics_df.withColumn("growth_percent", 
                                               F.when(F.col("prev_month_revenue").isNotNull() & (F.col("prev_month_revenue") > 0),
                                                      F.round(((F.col("total_revenue") - F.col("prev_month_revenue")) / F.col("prev_month_revenue")) * 100, 2))
                                                .otherwise(0.0))

        # 5. Saqlash
        # Parquet o'rniga JSON saqlash ham mumkin (Frontend osonroq o'qiydi), 
        # lekin Big Data uchun Parquet yaxshiroq. Shuning uchun Parquet qoldiramiz.
        analytics_df.coalesce(1).write.mode("overwrite").parquet(output_path)
        
        print(f"[OK] Spark Tahlil Yakunlandi. Output: {output_path}")

    except Exception as e:
        print(f"[ERROR] Spark Xatolik: {str(e)}")
    finally:
        spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-path", required=True)
    parser.add_argument("--output-path", required=True)
    parser.add_argument("--checkpoint-path", required=True)
    parser.add_argument("--app-name", default="V-ERP-Pro-Analytics")
    args, unknown = parser.parse_known_args()

    input_path = args.input_path.replace("\\", "/")
    output_path = args.output_path.replace("\\", "/")
    
    run_analytics(input_path, output_path, args.checkpoint_path)
