import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animeCharacters.css'

const AnimeCharacters = ({ characters }) => {
    // Adicionado um retorno se não houver personagens para evitar erros
    if (!characters || characters.length === 0) {
        return <p>Characters not available.</p>;
    }

    return (
        <div className="anime-characters">
            <div className="characters-grid">
                {characters.map((char) => (
                <div key={char.mal_id} className="character-card">
                    <Link to={`/character/${char.mal_id}`} className="character-link">
                        <img 
                            src={char.image_url} 
                            alt={char.name} 
                            className="character-image"
                        />
                        <p className="character-name">{char.name}</p>
                    </Link>
                </div>
                ))}
            </div>
        </div>
    );
};

export default AnimeCharacters;