import psycopg2

def sync_user_sequence_with_ratings():
    """
    Sincroniza a sequência da tabela 'users' baseando-se no maior user_id
    encontrado na tabela 'ratings' (importada do Kaggle).
    """
    # Configurações do Banco
    DB_NAME = "animesearch"
    DB_USER = "user"
    DB_PASSWORD = "password"
    DB_HOST = "localhost"
    
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        cur = conn.cursor()

        print("--- Iniciando Sincronização de Sequências ---")

        # 1. Descobrir qual é o MAIOR user_id presente na tabela RATINGS (Dataset Kaggle)
        print("Buscando o maior user_id na tabela 'ratings'...")
        cur.execute("SELECT MAX(user_id) FROM ratings;")
        max_rating_user_id = cur.fetchone()[0]

        # 2. Descobrir qual é o MAIOR user_id na tabela USERS (caso existam usuários criados manualmente)
        print("Buscando o maior user_id na tabela 'users'...")
        cur.execute("SELECT MAX(user_id) FROM users;")
        max_users_user_id = cur.fetchone()[0]

        # Trata casos de tabela vazia
        max_rating_user_id = max_rating_user_id if max_rating_user_id is not None else 0
        max_users_user_id = max_users_user_id if max_users_user_id is not None else 0

        # O novo valor deve ser o maior entre os dois + 1
        # Isso garante que não haverá conflito nem com o Kaggle nem com usuários manuais
        new_sequence_val = max(max_rating_user_id, max_users_user_id) + 1

        print(f"Maior ID no Ratings: {max_rating_user_id}")
        print(f"Maior ID no Users: {max_users_user_id}")
        print(f"Ajustando sequência para iniciar em: {new_sequence_val}")

        # 3. Ajusta a sequência da tabela users
        # pg_get_serial_sequence descobre o nome certo da sequência automaticamente
        query = f"SELECT setval(pg_get_serial_sequence('users', 'user_id'), {new_sequence_val}, false);"
        
        cur.execute(query)
        conn.commit()
        
        print("------------------------------------------------")
        print(f"SUCESSO! Sequência sincronizada.")
        print(f"O próximo usuário criado receberá o ID: {new_sequence_val}")
        print("Pode rodar o cadastro de novos usuários sem medo de conflito.")
        print("------------------------------------------------")
    
    except psycopg2.Error as e:
        print(f"Erro de Banco de Dados: {e}")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    sync_user_sequence_with_ratings()