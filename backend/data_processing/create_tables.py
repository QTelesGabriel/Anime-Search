# create_tables.py

import psycopg2

def create_tables():
    """Cria todas as tabelas no banco de dados, se elas não existirem."""
    
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

        commands = """
            -- Tabela principal de animes (adicionando 'type', 'source', 'duration', 'favorites')
            CREATE TABLE IF NOT EXISTS animes (
                mal_id INT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                title_japanese VARCHAR(255),
                synopsis TEXT,
                episodes INT,
                status VARCHAR(50),
                rank INT,
                score FLOAT,
                season VARCHAR(50),
                year INT,
                image_url VARCHAR(255),
                trailer_embed_url VARCHAR(255),
                type VARCHAR(50),
                source VARCHAR(50),
                duration VARCHAR(50),
                favorites INT
            );

            -- Tabelas de atributos para normalização
            CREATE TABLE IF NOT EXISTS genres (
                mal_id INT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS studios (
                mal_id INT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );

            -- Tabela de personagens (com campos adicionais)
            CREATE TABLE IF NOT EXISTS characters (
                mal_id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                name_kanji VARCHAR(255),
                nicknames TEXT,
                favorites INT,
                about TEXT,
                image_url VARCHAR(255)
            );
            
            -- Tabela para os dubladores (com campos adicionais)
            CREATE TABLE IF NOT EXISTS voice_actors (
                mal_id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image_url VARCHAR(255),
                birthday VARCHAR(255),
                about TEXT,
                language VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS streaming_services (
                id SERIAL PRIMARY KEY,
                mal_id INT UNIQUE,
                name VARCHAR(100) NOT NULL UNIQUE,
                url VARCHAR(255)
            );
            
            CREATE TABLE IF NOT EXISTS animes_genres (
                anime_mal_id INT REFERENCES animes(mal_id) ON DELETE CASCADE,
                genre_mal_id INT REFERENCES genres(mal_id) ON DELETE CASCADE,
                PRIMARY KEY (anime_mal_id, genre_mal_id)
            );

            CREATE TABLE IF NOT EXISTS animes_studios (
                anime_mal_id INT REFERENCES animes(mal_id) ON DELETE CASCADE,
                studio_mal_id INT REFERENCES studios(mal_id) ON DELETE CASCADE,
                PRIMARY KEY (anime_mal_id, studio_mal_id)
            );

            CREATE TABLE IF NOT EXISTS animes_characters (
                anime_mal_id INT REFERENCES animes(mal_id) ON DELETE CASCADE,
                character_mal_id INT REFERENCES characters(mal_id) ON DELETE CASCADE,
                PRIMARY KEY (anime_mal_id, character_mal_id)
            );
            
            CREATE TABLE IF NOT EXISTS characters_voice_actors (
                character_mal_id INT REFERENCES characters(mal_id) ON DELETE CASCADE,
                voice_actor_mal_id INT REFERENCES voice_actors(mal_id) ON DELETE CASCADE,
                PRIMARY KEY (character_mal_id, voice_actor_mal_id)
            );

            CREATE TABLE IF NOT EXISTS character_pictures (
                character_mal_id INT REFERENCES characters(mal_id) ON DELETE CASCADE,
                image_url VARCHAR(255) NOT NULL,
                PRIMARY KEY (character_mal_id, image_url)
            );
            
            CREATE TABLE IF NOT EXISTS animes_streaming (
                anime_mal_id INT REFERENCES animes(mal_id) ON DELETE CASCADE,
                service_id INT REFERENCES streaming_services(id) ON DELETE CASCADE,
                PRIMARY KEY (anime_mal_id, service_id)
            );
            
            CREATE TABLE IF NOT EXISTS login (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS ratings (
                user_id INT,
                anime_id INT,
                rating INT,
                PRIMARY KEY (user_id, anime_id)
            );
        """
        
        cur.execute(commands)
        conn.commit()
        print("Tabelas criadas com sucesso!")
        
    except psycopg2.Error as e:
        print(f"Erro ao criar tabelas: {e}")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    create_tables()