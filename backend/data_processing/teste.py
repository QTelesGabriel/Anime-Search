import requests
import json

# Configurações da API
JIKAN_BASE_URL = "https://api.jikan.moe/v4"
ANIME_ID = 21160  # ID para Attack on Titan (Shingeki no Kyojin)

def get_voice_actor_languages(anime_id):
    """
    Busca todas as línguas de dublagem para um anime e retorna os valores únicos.
    """
    url = f"{JIKAN_BASE_URL}/anime/{anime_id}/characters"
    
    print(f"Buscando dados de dubladores para o anime ID: {anime_id}...")
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Levanta um erro para status de erro (4xx ou 5xx)
        data = response.json().get('data', [])
        
        if not data:
            print("Nenhum dado de personagem/dublador encontrado.")
            return set()

        languages = set()
        for character_entry in data:
            for va_entry in character_entry.get('voice_actors', []):
                language = va_entry.get('language')
                if language:
                    languages.add(language)
        
        return languages

    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição à API Jikan: {e}")
        return set()

if __name__ == "__main__":
    unique_languages = get_voice_actor_languages(ANIME_ID)
    
    if unique_languages:
        print("\nAs línguas de dublagem únicas encontradas para este anime são:")
        for lang in sorted(list(unique_languages)):
            print(f"- {lang}")
    else:
        print("\nNão foi possível obter as línguas de dublagem. Verifique sua conexão ou o ID do anime.")