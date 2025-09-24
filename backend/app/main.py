import psycopg2
import threading
import os
from fastapi import FastAPI, HTTPException, status, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from surprise import dump
from typing import Optional

from pydantic import BaseModel
from typing import List, Dict

from .auth import hash_password, verify_password
from .models import UserCreate, UserLogin
from psycopg2.extras import DictCursor, DictRow

app = FastAPI()

# -----------------
# CLASSES DE DADOS E FUNÇÕES DE AUTENTICAÇÃO
# Essas são versões simples para que o código seja executável.
# Use as suas implementações reais se elas já existirem em outros arquivos.
# -----------------
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# -----------------
# FIM DAS VERSÕES SIMPLES
# -----------------

# -----------------
# Configurações do Banco de Dados
# -----------------
DB_NAME = os.getenv("DB_NAME", "animesearch")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASS", "password")
DB_HOST = os.getenv("DB_HOST", "db")

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
    "http://localhost:5174",
    "http://127.0.0.1:5174",
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
        cursor.execute("SELECT 1 FROM users WHERE username = %s;", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Usuário já registrado.")
        
        hashed_password = hash_password(user.password)
        insert_query = "INSERT INTO users (username, hashed_password) VALUES (%s, %s);"
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
        
        cursor.execute("SELECT user_id, hashed_password FROM users WHERE username = %s;", (user.username,))
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
def get_top_animes(limit: int = 20): # NOVO: Adiciona o parâmetro de limite
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
            LIMIT %s;
        """, (limit,)) # NOVO: Usa a variável 'limit'
        animes = cursor.fetchall()
        return [dict(row) for row in animes]
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

# Rota para obter a lista de todos os gêneros
@app.get("/animes/genres", response_model=List[Dict])
def get_all_genres():
    """
    Busca a lista de todos os gêneros disponíveis.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        cursor.execute("""
            SELECT mal_id, name FROM genres ORDER BY name;
        """)
        genres = cursor.fetchall()
        return [dict(row) for row in genres]
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

# Rota para obter animes por gênero
@app.get("/animes/genre/{genre_name}", response_model=List[Dict])
def get_animes_by_genre(genre_name: str = Path(..., title="Nome do Gênero"), limit: int = 20): # NOVO
    """
    Busca os melhores animes de um gênero específico, ordenados por score.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        query = """
            SELECT a.mal_id, a.title, a.image_url, a.score
            FROM animes a
            JOIN animes_genres ag ON a.mal_id = ag.anime_mal_id
            JOIN genres g ON ag.genre_mal_id = g.mal_id
            WHERE g.name = %s
            AND a.score IS NOT NULL
            ORDER BY a.score DESC
            LIMIT %s;
        """
        cursor.execute(query, (genre_name, limit)) # NOVO: Passa o limite para a query
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
def search_animes(q: str = Query(..., min_length=1), limit: int = 25):
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
            ORDER BY COALESCE(score, 0) DESC
            LIMIT %s;
        """, (search_query, limit))
        animes = cursor.fetchall()
        return [dict(row) for row in animes]
    finally:
        if 'cursor' in locals(): cursor.close()
        if conn: conn.close()

@app.get("/animes/autocomplete")
def autocomplete_animes(q: str = Query(..., min_length=2)):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    try:
        cursor = conn.cursor(cursor_factory=DictCursor)
        cursor.execute("""
            SELECT mal_id, title, image_url
            FROM animes
            WHERE LOWER(title) LIKE LOWER(%s) AND score IS NOT NULL
            ORDER BY score DESC, rank ASC
            LIMIT 5;
        """, (f"%{q}%",))
        results = cursor.fetchall()
        return [dict(row) for row in results]
    finally:
        if 'cursor' in locals(): cursor.close()
        if conn: conn.close()

@app.get("/recommendations/{user_id}")
def get_recommendations_svd(user_id: int, limit: int = 20):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cur = conn.cursor(cursor_factory=DictCursor)

        if svd_model is None:
            print("Modelo SVD não disponível. Retornando animes populares como fallback.")
            cur.execute("SELECT mal_id, title, score, image_url FROM animes WHERE score IS NOT NULL ORDER BY score DESC LIMIT %s;", (limit,))
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

        return recommendations[:limit]

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro na geração de recomendações: {error}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao gerar as recomendações.")
    finally:
        if conn:
            cur.close()
            conn.close()

class Rating(BaseModel):
    user_id: int
    anime_id: int
    rating: int

@app.post("/rate-anime")
async def rate_anime(rating_data: Rating):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    # Use o cursor com DictCursor para maior compatibilidade
    cursor = conn.cursor(cursor_factory=DictCursor)
    
    try:
        # 1. Insere ou atualiza a nota na tabela 'ratings'
        rating_query = "INSERT INTO ratings (user_id, anime_id, rating) VALUES (%s, %s, %s) ON CONFLICT (user_id, anime_id) DO UPDATE SET rating = EXCLUDED.rating"
        cursor.execute(rating_query, (rating_data.user_id, rating_data.anime_id, rating_data.rating))
        
        # 2. Insere ou atualiza o anime na tabela 'anime_user' com status 'completed'
        anime_user_query = "INSERT INTO anime_user (user_id, anime_id, status) VALUES (%s, %s, 'watching') ON CONFLICT (user_id, anime_id) DO UPDATE SET status = EXCLUDED.status"
        cursor.execute(anime_user_query, (rating_data.user_id, rating_data.anime_id)) # Removendo 'completed'
        
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        print(f"Erro na transação de avaliação: {e}")
        raise HTTPException(status_code=400, detail=f"Erro ao processar a requisição: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()
    
    return {"message": "Avaliação e status da lista salvos com sucesso!"}

@app.delete("/remove-rating/{user_id}/{anime_id}")
async def remove_rating(user_id: int, anime_id: int):
    """
    Remove a nota de um anime para um usuário específico.
    A operação DELETE não afeta o status do anime na tabela 'anime_user'.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor()
    
    try:
        # Executa o comando SQL para deletar a nota
        query = "DELETE FROM ratings WHERE user_id = %s AND anime_id = %s;"
        cursor.execute(query, (user_id, anime_id))
        
        # Confirma a exclusão no banco de dados
        conn.commit()
        
    except (Exception, psycopg2.DatabaseError) as error:
        conn.rollback()
        print(f"Erro ao remover a nota: {error}")
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro ao remover a nota: {error}")
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

    return {"message": "Nota removida com sucesso."}

class AnimeStatus(BaseModel):
    user_id: int
    anime_id: int
    status: Optional[str] = "watching"

# Endpoint para verificar o status do anime na lista do usuário
@app.get("/user-list-status/{user_id}/{anime_id}")
async def get_user_list_status(user_id: int, anime_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT EXISTS(SELECT 1 FROM anime_user WHERE user_id = %s AND anime_id = %s)"
    cursor.execute(query, (user_id, anime_id))
    is_in_list = cursor.fetchone()[0]
    
    conn.close()
    
    return {"is_in_list": is_in_list}

# Endpoint para adicionar o anime à lista
@app.post("/add-to-list")
async def add_to_list(anime_status: AnimeStatus):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "INSERT INTO anime_user (user_id, anime_id, status) VALUES (%s, %s, %s)"
        cursor.execute(query, (anime_status.user_id, anime_status.anime_id, anime_status.status))
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
    
    return {"message": "Anime adicionado à lista com sucesso!"}

# Endpoint para remover o anime da lista
@app.delete("/remove-from-list/{user_id}/{anime_id}")
async def remove_from_list(user_id: int, anime_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "DELETE FROM anime_user WHERE user_id = %s AND anime_id = %s"
        cursor.execute(query, (user_id, anime_id))

        query = "DELETE FROM ratings WHERE user_id = %s AND anime_id = %s"
        cursor.execute(query, (user_id, anime_id))

        conn.commit()
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
    
    return {"message": "Anime removido da lista com sucesso."}

@app.get("/user-rating/{user_id}/{anime_id}")
async def get_user_rating(user_id: int, anime_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Busca a avaliação na tabela 'ratings'
        query = "SELECT rating FROM ratings WHERE user_id = %s AND anime_id = %s"
        cursor.execute(query, (user_id, anime_id))
        result = cursor.fetchone()
        
        if result:
            # Se a avaliação for encontrada, retorna a nota
            return {"rating": result[0]}
        else:
            # Se a avaliação não for encontrada, retorna 0 ou um valor indicando que não há nota
            return {"rating": 0}

    except Exception as e:
        print(f"Erro ao buscar avaliação do usuário: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    finally:
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
        
        # 1. Busca os dados principais do anime, incluindo os novos campos
        cur.execute("""
            SELECT 
                mal_id, title, title_japanese, synopsis, episodes, status, rank, score, 
                season, year, image_url, trailer_embed_url, type, source, duration, favorites 
            FROM animes 
            WHERE mal_id = %s;
        """, (mal_id,))
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
            SELECT 
                c.mal_id, c.name, c.image_url, 
                va.mal_id AS va_mal_id, va.name AS va_name, va.image_url AS va_image_url, va.language AS va_language
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
                    'image_url': row['va_image_url'],
                    'language': row['va_language']
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

@app.get("/character/{mal_id}")
def get_character_details(mal_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # 1. Busca todos os dados do personagem de uma vez
        cur.execute("""
            SELECT mal_id, name, name_kanji, nicknames, favorites, about, image_url
            FROM characters
            WHERE mal_id = %s;
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
            SELECT 
                va.mal_id, va.name, va.image_url, va.birthday, va.about, va.language
            FROM characters_voice_actors cva
            JOIN voice_actors va ON cva.voice_actor_mal_id = va.mal_id
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
        
        # 1. Busca todos os dados do dublador de uma vez
        cur.execute("""
            SELECT mal_id, name, image_url, birthday, about, language
            FROM voice_actors
            WHERE mal_id = %s;
        """, (mal_id,))
        voice_actor = cur.fetchone()
        
        if not voice_actor:
            raise HTTPException(status_code=404, detail="Dublador não encontrado.")

        voice_actor_details = dict(voice_actor)

        # 2. Busca e adiciona os personagens dublados por ele
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

@app.get("/character/{mal_id}/animes")
def get_animes_by_character(mal_id: int):
    """
    Retorna todos os animes nos quais o personagem aparece.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT a.mal_id, a.title, a.image_url
            FROM animes a
            JOIN animes_characters ac ON a.mal_id = ac.anime_mal_id
            WHERE ac.character_mal_id = %s;
        """
        cur.execute(query, (mal_id,))
        animes = cur.fetchall()
        
        return [dict(row) for row in animes]
    
    except Exception as e:
        print(f"Erro ao buscar animes do personagem {mal_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar animes do personagem")
    finally:
        if conn:
            cur.close()
            conn.close()
            
# Seu endpoint corrigido
@app.get("/my-animes/{user_id}")
def get_my_animes(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

    try:
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # AQUI ESTÁ A CORREÇÃO:
        # A consulta agora faz o JOIN com a tabela 'anime_user'
        # e seleciona apenas os animes que o usuário adicionou.
        cur.execute("""
            SELECT a.mal_id, a.title, a.image_url
            FROM animes a
            JOIN anime_user au ON a.mal_id = au.anime_id
            WHERE au.user_id = %s
            ORDER BY a.title ASC;
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