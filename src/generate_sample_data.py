import csv
import os
import random
from datetime import datetime, timedelta

def generate_store_data(output_dir, num_files=5, rows_per_file=300):
    """Do'kon uchun maxsulotlar savdosi ma'lumotlarini yaratadi."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    kategoriyalar = {
        "Elektronika": ["iPhone 15", "Samsung S24", "MacBook Air", "AirPods Pro", "Xiaomi Pad 6"],
        "Kiyim-kechak": ["Futbolka", "Jinsi shim", "Kurtka", "Krossovka", "Kostyum-shim"],
        "Maishiy texnika": ["Muzlatgich", "Kir yuvish mashinasi", "Changyutgich", "Mikroto'lqinli pech"],
        "Oziq-ovqat": ["Guruch", "Yog'", "Shakar", "Sut mahsulotlari", "Go'sht"],
        "Kitoblar": ["Badiiy adabiyot", "Darsliklar", "Psixologiya", "Biznes va iqtisod"]
    }
    
    start_date = datetime(2024, 1, 1)

    for i in range(num_files):
        filename = f"dokon_sotuvlari_{i+1}.csv"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # Ustunlar: ID, Maxsulot nomi, Kategoriya, Narx, Miqdor, Sana, Mijoz_ID
            writer.writerow(["order_id", "product_name", "category", "amount", "quantity", "order_date", "customer_id"])
            
            for _ in range(rows_per_file):
                kategoriya = random.choice(list(kategoriyalar.keys()))
                maxsulot = random.choice(kategoriyalar[kategoriya])
                order_id = f"SO-{random.randint(100000, 999999)}"
                customer_id = f"MIJ-{random.randint(1000, 9999)}"
                # Narxlar doirasi kategoriya bo'yicha (taxminiy)
                base_price = 10.0 if kategoriya == "Oziq-ovqat" else 500.0
                narx = round(random.uniform(base_price, base_price * 10), 2)
                miqdor = random.randint(1, 10)
                sana = (start_date + timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d")
                
                writer.writerow([order_id, maxsulot, kategoriya, narx, miqdor, sana, customer_id])
        
        print(f"Generatsiya qilindi: {filepath}")

if __name__ == "__main__":
    data_path = os.path.join(os.getcwd(), "data", "raw_orders")
    generate_store_data(data_path)
