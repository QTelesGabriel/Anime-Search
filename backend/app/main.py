import psycopg2
import os
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from surprise import dump

from pydantic import BaseModel

# Assumindo que você tem esses arquivos no mesmo diretório ou em um pacote importável
from .auth import hash_password, verify_password
from .models import UserCreate, UserLogin
from psycopg2.extras import DictCursor, DictRow

app = FastAPI()

# -----------------
# Configurações do Banco de Dados
# -----------------
DB_NAME = os.getenv("DB_NAME", "animesearch")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASS", "password")
DB_HOST = os.getenv("DB_HOST", "db") # Alterado para "db" para o ambiente Docker

def get_db_connection():
    """Conecta ao banco de dados PostgreSQL."""
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

# Variável para armazenar o modelo SVD carregado
svd_model = None

@app.on_event("startup")
def load_svd_model():
    """Carrega o modelo SVD ao iniciar o servidor."""
    global svd_model
    try:
        file_path = "model_machine_learning/recommendation_ml.pkl"
        _, svd_model = dump.load(file_path)
        print(f"Modelo SVD '{file_path}' carregado com sucesso!")
    except FileNotFoundError:
        print(f"Arquivo do modelo SVD '{file_path}' não encontrado. As recomendações usarão o fallback.")
        svd_model = None
    except Exception as e:
        print(f"Erro ao carregar o modelo SVD: {e}")
        svd_model = None

# -----------------
# Configuração do CORS
# -----------------
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# Endpoints de Autenticação
# -----------------
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM login WHERE username = %s;", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Usuário já registrado.")
        
        hashed_password = hash_password(user.password)
        insert_query = "INSERT INTO login (username, hashed_password) VALUES (%s, %s);"
        cursor.execute(insert_query, (user.username, hashed_password))
        conn.commit()

    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

    return {"message": "Usuário registrado com sucesso!"}

@app.post("/login", status_code=status.HTTP_200_OK)
def login_user(user: UserLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT user_id, hashed_password FROM login WHERE username = %s;", (user.username,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

        user_id_db, hashed_password_db = result

        if not verify_password(user.password, hashed_password_db):
            raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

    return {"message": "Login bem-sucedido!", "user_id": user_id_db}

# -----------------
# Endpoints de Recomendação e Detalhes
# -----------------
@app.get("/")
def read_root():
    return {"Hello": "Welcome to the Anime API"}
    
@app.get("/animes/top")
def get_top_animes():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        cursor.execute("""
            SELECT mal_id, title, image_url
            FROM animes
            WHERE score IS NOT NULL
            ORDER BY score DESC
            LIMIT 20;
        """)
        animes = cursor.fetchall()
        return [dict(row) for row in animes]
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

@app.get("/animes/popular")
def get_popular_animes():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        cursor.execute("""
            SELECT mal_id, title, image_url
            FROM animes
            WHERE members IS NOT NULL
            ORDER BY members DESC
            LIMIT 20;
        """)
        animes = cursor.fetchall()
        return [dict(row) for row in animes]
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

@app.get("/animes/search")
def search_animes(q: str = Query(..., min_length=1)):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        search_query = f"%{q.lower()}%"
        cursor.execute("""
            SELECT mal_id, title, image_url
            FROM animes
            WHERE LOWER(title) LIKE %s
            ORDER BY score DESC
            LIMIT 25;
        """, (search_query,))
        animes = cursor.fetchall()
        return [dict(row) for row in animes]
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

@app.get("/recommendations/{user_id}")
def get_recommendations_svd(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cur = conn.cursor(cursor_factory=DictCursor)

        if svd_model is None:
            print("Modelo SVD não disponível. Retornando animes populares como fallback.")
            cur.execute("SELECT mal_id, title, score, image_url FROM animes ORDER BY score DESC LIMIT 20;")
            recommendations = cur.fetchall()
            return [dict(rec) for rec in recommendations]

        cur.execute("SELECT anime_id FROM ratings WHERE user_id = %s;", (user_id,))
        rated_anime_ids = {row['anime_id'] for row in cur.fetchall()}

        cur.execute("SELECT mal_id, title, image_url FROM animes;")
        all_animes = cur.fetchall()

        recommendations = []
        for anime in all_animes:
            if anime['mal_id'] not in rated_anime_ids:
                predicted_rating = svd_model.predict(str(user_id), str(anime['mal_id'])).est
                recommendations.append({
                    "mal_id": anime['mal_id'],
                    "title": anime['title'],
                    "image_url": anime['image_url'],
                    "predicted_rating": predicted_rating
                })

        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)

        return recommendations[:20]

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na geração de recomendações: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao gerar as recomendações.")
    finally:
        if conn:
            cur.close()
            conn.close()

# -----------------
# Endpoints de Detalhes (Atualizados)
# -----------------

@app.get("/anime/{mal_id}")
def get_anime_details(mal_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # 1. Busca os dados principais do anime
        cur.execute("SELECT * FROM animes WHERE mal_id = %s;", (mal_id,))
        anime = cur.fetchone()
        
        if not anime:
            raise HTTPException(status_code=404, detail="Anime não encontrado.")

        anime_details = dict(anime)

        # 2. Busca e adiciona os gêneros
        cur.execute("""
            SELECT g.name FROM animes_genres ag 
            JOIN genres g ON ag.genre_mal_id = g.mal_id 
            WHERE ag.anime_mal_id = %s;
        """, (mal_id,))
        anime_details['genres'] = [row['name'] for row in cur.fetchall()]

        # 3. Busca e adiciona os estúdios
        cur.execute("""
            SELECT s.name FROM animes_studios ast 
            JOIN studios s ON ast.studio_mal_id = s.mal_id 
            WHERE ast.anime_mal_id = %s;
        """, (mal_id,))
        anime_details['studios'] = [row['name'] for row in cur.fetchall()]

        # 4. Busca e adiciona os serviços de streaming com URL
        cur.execute("""
            SELECT ss.name, ss.url FROM animes_streaming a_s 
            JOIN streaming_services ss ON a_s.service_id = ss.id 
            WHERE a_s.anime_mal_id = %s;
        """, (mal_id,))
        anime_details['streaming'] = [dict(row) for row in cur.fetchall()]

        # 5. Busca personagens e dubladores (básico)
        cur.execute("""
            SELECT c.mal_id, c.name, c.image_url, 
                   va.mal_id as va_mal_id, va.name as va_name, va.image_url as va_image_url
            FROM animes_characters ac
            JOIN characters c ON ac.character_mal_id = c.mal_id
            LEFT JOIN characters_voice_actors cva ON c.mal_id = cva.character_mal_id
            LEFT JOIN voice_actors va ON cva.voice_actor_mal_id = va.mal_id
            WHERE ac.anime_mal_id = %s;
        """, (mal_id,))
        
        characters_raw = cur.fetchall()
        characters_dict = {}
        for row in characters_raw:
            char_id = row['mal_id']
            if char_id not in characters_dict:
                characters_dict[char_id] = {
                    'mal_id': char_id,
                    'name': row['name'],
                    'image_url': row['image_url'],
                    'voice_actors': []
                }
            if row['va_mal_id']:
                characters_dict[char_id]['voice_actors'].append({
                    'mal_id': row['va_mal_id'],
                    'name': row['va_name'],
                    'image_url': row['va_image_url']
                })
        
        anime_details['characters'] = list(characters_dict.values())
        
        return anime_details

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na consulta SQL para o anime ID {mal_id}: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao buscar os detalhes do anime.")
    finally:
        if conn:
            cur.close()
            conn.close()

class Rating(BaseModel):
    user_id: int
    anime_id: int
    rating: int

@app.post("/rate-anime", status_code=status.HTTP_201_CREATED)
def rate_anime(rating: Rating):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO ratings (user_id, anime_id, rating)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, anime_id) DO UPDATE
            SET rating = EXCLUDED.rating;
        """, (rating.user_id, rating.anime_id, rating.rating))
        
        conn.commit()
        
        return {"message": "Avaliação salva com sucesso!"}
    
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.get("/character/{mal_id}")
def get_character_details(mal_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # 1. Busca os dados principais e detalhes do personagem
        cur.execute("""
            SELECT c.mal_id, c.name, c.image_url, 
                   cd.about, cd.favorites
            FROM characters c
            LEFT JOIN character_details cd ON c.mal_id = cd.mal_id
            WHERE c.mal_id = %s;
        """, (mal_id,))
        character = cur.fetchone()
        
        if not character:
            raise HTTPException(status_code=404, detail="Personagem não encontrado.")

        character_details = dict(character)

        # 2. Busca e adiciona as fotos do personagem
        cur.execute("""
            SELECT image_url FROM character_pictures
            WHERE character_mal_id = %s;
        """, (mal_id,))
        character_details['pictures'] = [row['image_url'] for row in cur.fetchall()]

        # 3. Busca e adiciona os dubladores e seus detalhes completos
        cur.execute("""
            SELECT va.mal_id, va.name, va.image_url,
                   vad.about, vad.birthday
            FROM characters_voice_actors cva
            JOIN voice_actors va ON cva.voice_actor_mal_id = va.mal_id
            LEFT JOIN voice_actor_details vad ON va.mal_id = vad.mal_id
            WHERE cva.character_mal_id = %s;
        """, (mal_id,))
        
        voice_actors = [dict(row) for row in cur.fetchall()]
        character_details['voice_actors'] = voice_actors
        
        return character_details

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na consulta SQL para o personagem ID {mal_id}: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao buscar os detalhes do personagem.")
    finally:
        if conn:
            cur.close()
            conn.close()

@app.get("/voice-actor/{mal_id}")
def get_voice_actor_details(mal_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # 1. Busca os dados principais e detalhes do dublador
        cur.execute("""
            SELECT va.mal_id, va.name, va.image_url,
                   vad.about, vad.birthday
            FROM voice_actors va
            LEFT JOIN voice_actor_details vad ON va.mal_id = vad.mal_id
            WHERE va.mal_id = %s;
        """, (mal_id,))
        voice_actor = cur.fetchone()
        
        if not voice_actor:
            raise HTTPException(status_code=404, detail="Dublador não encontrado.")

        voice_actor_details = dict(voice_actor)

        # 2. Busca e adiciona os personagens dublados
        cur.execute("""
            SELECT c.mal_id, c.name, c.image_url
            FROM characters_voice_actors cva
            JOIN characters c ON cva.character_mal_id = c.mal_id
            WHERE cva.voice_actor_mal_id = %s;
        """, (mal_id,))
        
        voice_actor_details['characters'] = [dict(row) for row in cur.fetchall()]
        
        return voice_actor_details

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na consulta SQL para o dublador ID {mal_id}: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao buscar os detalhes do dublador.")
    finally:
        if conn:
            cur.close()
            conn.close()
            
@app.get("/my-animes/{user_id}")
def get_my_animes(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT a.mal_id, a.title, a.image_url, r.rating
            FROM animes a
            JOIN ratings r ON a.mal_id = r.anime_id
            WHERE r.user_id = %s
            ORDER BY r.rating DESC;
        """, (user_id,))
        
        my_animes_list = cur.fetchall()
        
        return [dict(row) for row in my_animes_list]

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na busca de animes do usuário: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao buscar sua lista de animes.")
    finally:
        if conn:
            cur.close()
            conn.close()