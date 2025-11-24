import os
import pandas as pd
import psycopg2
from surprise import Reader, Dataset, SVD, dump

# Configurações do Banco de Dados
# (Mesmas credenciais que você usou nos outros scripts)
DB_NAME = "animesearch"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "localhost"

def get_db_connection():
    """Estabelece conexão com o banco de dados."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        return conn
    except psycopg2.Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

def load_data_from_db():
    print("--- Conectando ao Banco de Dados para buscar Ratings ---")
    conn = get_db_connection()
    if not conn:
        raise ConnectionError("Não foi possível conectar ao banco de dados.")

    try:
        # Query otimizada: Já filtramos os ratings -1 aqui mesmo no SQL
        # Isso economiza memória e processamento no Python
        query = """
            SELECT user_id, anime_id, rating 
            FROM ratings 
            WHERE rating != -1
        """
        
        # O pandas tem uma função ótima para ler SQL direto para DataFrame
        df_ratings = pd.read_sql(query, conn)
        
        print(f"Dados carregados com sucesso! Total de avaliações: {len(df_ratings)}")
        return df_ratings

    except Exception as e:
        print(f"Erro ao executar a query: {e}")
        raise e
    finally:
        conn.close()

def train_model(rating_df):
    print("--- Preparando Dados para o Surprise ---")
    # O rating_scale continua sendo de 0 a 10 conforme seu notebook original
    reader = Reader(rating_scale=(0, 10))
    
    # O dataframe já vem com as colunas certas do SQL
    data = Dataset.load_from_df(rating_df[['user_id', 'anime_id', 'rating']], reader)

    print("--- Treinando Modelo SVD (Isso pode levar alguns minutos) ---")
    
    # Usando os melhores parâmetros definidos anteriormente
    algo = SVD(
        n_factors=160,
        n_epochs=25,
        lr_all=0.01,
        reg_all=0.1,
        lr_bi=0.008,
        reg_bi=0.02,
        random_state=2025
    )

    # Treinando com todos os dados disponíveis no banco
    trainset = data.build_full_trainset()
    algo.fit(trainset)
    
    return algo

def save_model(algo, output_path):
    print(f"--- Salvando modelo em: {output_path} ---")
    
    # Garante que a pasta existe
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    dump.dump(output_path, predictions=None, algo=algo)
    print("Modelo salvo com sucesso!")

if __name__ == "__main__":
    # 1. Pega o diretório onde este script está (ex: .../backend/scripts)
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Sobe um nível para o diretório pai (ex: .../backend)
    PARENT_DIR = os.path.dirname(SCRIPT_DIR)
    
    # 3. Aponta para a pasta irmã (ex: .../backend/model_machine_learning/...)
    MODEL_OUTPUT = os.path.join(PARENT_DIR, "model_machine_learning/recommendation_ml.pkl")

    print(f"--- O modelo será salvo em: {MODEL_OUTPUT} ---")

    try:
        # 1. Carregar dados do Postgres
        df_ratings = load_data_from_db()
        
        if df_ratings.empty:
            print("Aviso: A tabela 'ratings' está vazia ou só tem ratings -1. O treino foi abortado.")
        else:
            # 2. Treinar
            model = train_model(df_ratings)
            
            # 3. Salvar
            save_model(model, MODEL_OUTPUT)
        
    except Exception as e:
        print(f"Erro fatal no processo: {e}")