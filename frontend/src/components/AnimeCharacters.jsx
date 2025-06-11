import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animeCharacters.css'

const AnimeCharacters = ({ characters }) => {
    return (
        <div className="anime-characters">
            <div className="characters-grid">
                {characters?.map((char, index) => (
                <div key={index} className="character-card">
                    <Link to={`/character/${char.character.mal_id}`} className="character-link">
                        <img 
                            src={char.character.images.jpg.image_url} 
                            alt={char.character.name} 
                            className="character-image"
                        />
                        <p className="character-name">{char.character.name}</p>
                    </Link>
                </div>
                ))}
            </div>
        </div>
    );
};

export default AnimeCharacters;
