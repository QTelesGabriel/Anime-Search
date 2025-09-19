import psycopg2

def adjust_sequence():
    """Ajusta a sequência do ID da tabela de login para evitar conflitos."""
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

        # Altera a sequência para começar após o maior ID do DataFrame
        cur.execute("SELECT setval('login_user_id_seq', 73517, true);")
        conn.commit()
        print("Sequência 'login_user_id_seq' ajustada com sucesso para 73517.")
    
    except psycopg2.Error as e:
        print(f"Erro ao ajustar a sequência: {e}")
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    adjust_sequence()