import pandas as pd
import psycopg2
from psycopg2 import sql

# Connection configurations
user = 'user'
password = 'password'
host = 'localhost'
port = '5432'
database = 'recommendation'

# CSV path
# It needs to be in the data_processing directory to run correctly"
csv_file = "../data/final_rating.csv"

# Table name
table_name = 'ratings'

# Load CSV
df = pd.read_csv(csv_file)

# Connection
conn = psycopg2.connect(
    dbname=database, user=user, password=password, host=host, port=port
)
cur = conn.cursor()

# Create table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
    user_id INT,
    anime_id INT,
    rating INT
);
"""

cur.execute(create_table_query)
conn.commit()

# Insert query with placeholders
insert_query = sql.SQL(
    f"INSERT INTO {table_name} (user_id, anime_id, rating) VALUES (%s, %s, %s)"
)

# Iterate and insert
for index, row in df.iterrows():
    cur.execute(insert_query, (
        int(row['user_id']), 
        int(row['anime_id']), 
        int(row['rating'])
    ))
    print(f"user_id: {row['user_id']}  anime_id: {row['anime_id']}  rating: {row['rating']}")

conn.commit()

# Finalize
cur.close()
conn.close()

print("Tabela criada e dados inseridos com sucesso!")
