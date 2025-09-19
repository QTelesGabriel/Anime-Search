import time
import requests
import psycopg2
from psycopg2.extras import execute_values
import json
import os

# -----------------
# Configurações do Banco de Dados
# -----------------
DB_NAME = "animesearch"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "localhost"

# -----------------
# Configurações da API Jikan
# -----------------
JIKAN_BASE_URL = "https://api.jikan.moe/v4"
REQUEST_INTERVAL = 0.4
MAX_RETRIES = 5
INITIAL_BACKOFF = 2

# -----------------
# Conexão com o Banco de Dados
# -----------------
def get_db_connection():
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
    
# -----------------
# Arquivos de persistência
# -----------------
PAGE_FILE = "cache/last_page.json"
ANIME_CACHE_FILE = "cache/anime_cache.json"
CHARACTER_CACHE_FILE = "cache/character_cache.json"
VOICE_ACTOR_CACHE_FILE = "cache/voice_actor_cache.json"

# -----------------
# Funções utilitárias
# -----------------
def load_json_set(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()

def save_json_set(filename, data_set):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(list(data_set), f, ensure_ascii=False, indent=2)

def load_last_page():
    if os.path.exists(PAGE_FILE):
        with open(PAGE_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("page", 1)
    return 1

def save_last_page(page):
    with open(PAGE_FILE, "w", encoding="utf-8") as f:
        json.dump({"page": page}, f)

# -----------------
# Inicialização dos caches
# -----------------
anime_cache = load_json_set(ANIME_CACHE_FILE)
character_cache = load_json_set(CHARACTER_CACHE_FILE)
voice_actor_cache = load_json_set(VOICE_ACTOR_CACHE_FILE)

# -----------------
# Funções de inserção
# -----------------
def insert_anime(cursor, anime):
    query = """
    INSERT INTO animes (mal_id, title, title_japanese, synopsis, episodes, status, rank, score, season, year, image_url, trailer_embed_url)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (mal_id) DO UPDATE SET
        title = EXCLUDED.title,
        title_japanese = EXCLUDED.title_japanese,
        synopsis = EXCLUDED.synopsis,
        episodes = EXCLUDED.episodes,
        status = EXCLUDED.status,
        rank = EXCLUDED.rank,
        score = EXCLUDED.score,
        season = EXCLUDED.season,
        year = EXCLUDED.year,
        image_url = EXCLUDED.image_url,
        trailer_embed_url = EXCLUDED.trailer_embed_url;
    """
    cursor.execute(query, (
        anime.get('mal_id'),
        anime.get('title'),
        anime.get('title_japanese'),
        anime.get('synopsis'),
        anime.get('episodes'),
        anime.get('status'),
        anime.get('rank'),
        anime.get('score'),
        anime.get('season'),
        anime.get('year'),
        anime.get('images', {}).get('jpg', {}).get('large_image_url'),
        anime.get('trailer', {}).get('embed_url')
    ))

    print(f"[ANIME] Inserido/Atualizado: {anime.get('title')} (ID {anime.get('mal_id')})")

def insert_entity(cursor, table_name, mal_id, name, url=None):
    """Insere gêneros, estúdios ou serviços de streaming no banco."""
    table_map = {
        'genre': 'genres',
        'studio': 'studios',
        'streaming_services': 'streaming_services',
    }
    final_table_name = table_map.get(table_name)

    if not name or not final_table_name:
        return

    if url is not None:
        query = f"""
        INSERT INTO {final_table_name} (mal_id, name, url)
        VALUES (%s, %s, %s)
        ON CONFLICT (name) DO UPDATE
            SET url = COALESCE(EXCLUDED.url, {final_table_name}.url),
                mal_id = COALESCE(EXCLUDED.mal_id, {final_table_name}.mal_id);
        """
        cursor.execute(query, (mal_id, name, url))

        print(f"[STREAMING] Inserido/Atualizado: {name} (ID {mal_id}) - URL: {url}")
    else:
        query = f"""
        INSERT INTO {final_table_name} (mal_id, name)
        VALUES (%s, %s)
        ON CONFLICT (mal_id) DO NOTHING;
        """
        cursor.execute(query, (mal_id, name))

        print(f"[{table_name.upper()}] Inserido/Atualizado: {name} (ID {mal_id})")

def insert_voice_actor(cursor, mal_id, name, image_url=None, birthday=None, about=None):
    query = """
    INSERT INTO voice_actors (mal_id, name, image_url, birthday, about)
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (mal_id) DO UPDATE SET
        name = EXCLUDED.name,
        image_url = COALESCE(EXCLUDED.image_url, voice_actors.image_url),
        birthday = COALESCE(EXCLUDED.birthday, voice_actors.birthday),
        about = COALESCE(EXCLUDED.about, voice_actors.about);
    """
    cursor.execute(query, (mal_id, name, image_url, birthday, about))

    print(f"[DUBLADOR] Inserido/Atualizado: {name} (ID {mal_id})")

def insert_character(cursor, mal_id, name, image_url=None):
    query = """
    INSERT INTO characters (mal_id, name, image_url)
    VALUES (%s, %s, %s)
    ON CONFLICT (mal_id) DO UPDATE SET
        name = EXCLUDED.name,
        image_url = COALESCE(EXCLUDED.image_url, characters.image_url);
    """
    cursor.execute(query, (mal_id, name, image_url))

    print(f"[CHARACTER] Inserido/Atualizado: {name} (ID {mal_id})")

def insert_character_picture(cursor, character_id, image_url):
    query = """
    INSERT INTO character_pictures (character_mal_id, image_url)
    VALUES (%s, %s)
    ON CONFLICT DO NOTHING;
    """
    cursor.execute(query, (character_id, image_url))

    print(f"[CHARACTER PICTURE] Inserida para ID {character_id}: {image_url}")

def insert_junction(cursor, table, anime_id=None, character_id=None, related_id=None, service_id=None):
    if table == 'animes_genres':
        cursor.execute(
            "INSERT INTO animes_genres (anime_mal_id, genre_mal_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (anime_id, related_id)
        )
        print(f"[REL] Anime {anime_id} -> Genre {related_id}")
    elif table == 'animes_studios':
        cursor.execute(
            "INSERT INTO animes_studios (anime_mal_id, studio_mal_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (anime_id, related_id)
        )
        print(f"[REL] Anime {anime_id} -> Studio {related_id}")
    elif table == 'animes_characters':
        cursor.execute(
            "INSERT INTO animes_characters (anime_mal_id, character_mal_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (anime_id, related_id)
        )
        print(f"[REL] Anime {anime_id} -> Character {related_id}")
    elif table == 'characters_voice_actors':
        cursor.execute(
            "INSERT INTO characters_voice_actors (character_mal_id, voice_actor_mal_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (character_id, related_id)
        )
        print(f"[REL] Character {character_id} -> Voice Actor {related_id}")
    elif table == 'animes_streaming':
        cursor.execute(
            "INSERT INTO animes_streaming (anime_mal_id, service_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (anime_id, service_id)
        )
        print(f"[REL] Anime {anime_id} -> Streaming Service {service_id}")

# -----------------
# Funções de requisição
# -----------------
def fetch_json(url):
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(url)
            r.raise_for_status()
            time.sleep(REQUEST_INTERVAL)
            return r.json().get('data')
        except requests.exceptions.RequestException:
            time.sleep(INITIAL_BACKOFF * (2 ** attempt))
    return None

def process_anime(cursor, anime_id):
    if anime_id in anime_cache:
        return
    anime_cache.add(anime_id)

    anime_data = fetch_json(f"{JIKAN_BASE_URL}/anime/{anime_id}/full")
    if not anime_data:
        return

    insert_anime(cursor, anime_data)

    # Gêneros
    for genre in anime_data.get('genres', []):
        insert_entity(cursor, 'genre', genre.get('mal_id'), genre.get('name'))
        insert_junction(cursor, 'animes_genres', anime_id=anime_id, related_id=genre.get('mal_id'))

    # Studios
    for studio in anime_data.get('studios', []):
        insert_entity(cursor, 'studio', studio.get('mal_id'), studio.get('name'))
        insert_junction(cursor, 'animes_studios', anime_id=anime_id, related_id=studio.get('mal_id'))

    # Streaming
    for streaming in anime_data.get('streaming', []):
        streaming_mal_id = streaming.get('mal_id')
        streaming_name = streaming.get('name')
        streaming_url = streaming.get('url')
        if not streaming_name:
            continue

        cursor.execute("SELECT id FROM streaming_services WHERE name = %s", (streaming_name,))
        service_row = cursor.fetchone()
        if service_row:
            service_id = service_row[0]
            cursor.execute(
                "UPDATE streaming_services SET mal_id = COALESCE(%s, mal_id), url = COALESCE(%s, url) WHERE id = %s;",
                (streaming_mal_id, streaming_url, service_id)
            )
        else:
            cursor.execute(
                "INSERT INTO streaming_services (mal_id, name, url) VALUES (%s, %s, %s) RETURNING id;",
                (streaming_mal_id, streaming_name, streaming_url)
            )
            service_id = cursor.fetchone()[0]

        insert_junction(cursor, 'animes_streaming', anime_id=anime_id, service_id=service_id)

    # Characters e Voice Actors
    characters_data = fetch_json(f"{JIKAN_BASE_URL}/anime/{anime_id}/characters")
    if not characters_data:
        return

    for entry in characters_data:
        char_info = entry.get('character')
        if not char_info or char_info.get('mal_id') in character_cache:
            continue
        character_cache.add(char_info['mal_id'])

        insert_character(cursor, char_info.get('mal_id'), char_info.get('name'), char_info.get('images', {}).get('jpg', {}).get('image_url'))
        insert_junction(cursor, 'animes_characters', anime_id=anime_id, related_id=char_info.get('mal_id'))

        # Fotos extras
        pictures = fetch_json(f"{JIKAN_BASE_URL}/characters/{char_info.get('mal_id')}/pictures")
        if pictures:
            for pic in pictures:
                insert_character_picture(cursor, char_info.get('mal_id'), pic.get('jpg', {}).get('image_url'))

        # Voice Actors
        for va_entry in entry.get('voice_actors', []):
            va_info = va_entry.get('person')
            if not va_info or va_info.get('mal_id') in voice_actor_cache:
                continue
            voice_actor_cache.add(va_info.get('mal_id'))

            insert_voice_actor(
                cursor,
                va_info.get('mal_id'),
                va_info.get('name'),
                image_url=va_info.get('images', {}).get('jpg', {}).get('image_url'),
                birthday=va_info.get('birthday'),
                about=va_info.get('about')
            )
            insert_junction(cursor, 'characters_voice_actors', character_id=char_info.get('mal_id'), related_id=va_info.get('mal_id'))

# -----------------
# Main
# -----------------
def main():
    conn = get_db_connection()
    if not conn:
        return
    
    os.makedirs("cache", exist_ok=True)

    try:
        cursor = conn.cursor()
        page = load_last_page()  # carrega a última página processada

        while True:
            anime_list = fetch_json(f"{JIKAN_BASE_URL}/anime?page={page}")
            if not anime_list:
                break

            for anime in anime_list:
                process_anime(cursor, anime.get('mal_id'))
                conn.commit()

                # Atualiza caches em tempo real
                save_json_set(ANIME_CACHE_FILE, anime_cache)
                save_json_set(CHARACTER_CACHE_FILE, character_cache)
                save_json_set(VOICE_ACTOR_CACHE_FILE, voice_actor_cache)

            # Atualiza página depois de processar completamente
            page += 1
            save_last_page(page)

    finally:
        if conn:
            conn.close()
        if cursor:
            cursor.close()
