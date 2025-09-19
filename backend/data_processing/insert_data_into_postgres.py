import os
import pandas as pd
import psycopg2
from psycopg2 import sql
from psycopg2.extras import execute_values

# Connection configurations
user = 'user'
password = 'password'
host = 'localhost'
port = '5432'
database = 'animesearch'

# CSV path
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(script_dir, '../data/rating.csv')

# Table name
table_name = 'ratings'

# Load CSV
try:
    df = pd.read_csv(csv_file_path)
    print("Arquivo CSV carregado com sucesso!")
except FileNotFoundError:
    print(f"Erro: O arquivo CSV '{csv_file_path}' não foi encontrado.")
    exit()

conn = None
cur = None

try:
    # Connection
    conn = psycopg2.connect(
        dbname=database, user=user, password=password, host=host, port=port
    )
    cur = conn.cursor()

    # Convert DataFrame to a list of tuples for batch insertion
    data_to_insert = [
        (int(row['user_id']), int(row['anime_id']), int(row['rating']))
        for _, row in df.iterrows()
    ]
    
    # Use ON CONFLICT para ignorar entradas duplicadas
    insert_query = sql.SQL("""
        INSERT INTO {table_name} (user_id, anime_id, rating) VALUES %s
        ON CONFLICT (user_id, anime_id) DO NOTHING;
    """).format(table_name=sql.Identifier(table_name))

    # Use execute_values for efficient batch insertion
    execute_values(cur, insert_query, data_to_insert)
    conn.commit()

    print(f"{len(data_to_insert)} linhas processadas. Duplicatas foram ignoradas.")

except (Exception, psycopg2.DatabaseError) as error:
    print(f"Erro ao inserir dados: {error}")
    if conn:
        conn.rollback()

finally:
    # Finalize connections
    if cur:
        cur.close()
    if conn:
        conn.close()