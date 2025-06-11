import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/character.css';

const Character = () => {

    const { id } = useParams();
    const baseURL = "https://api.jikan.moe/v4"

    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);

    const decodeHTML = (html) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    useEffect(() => {
        const getCharacterFullByID = async () => {
            try {
                const responseCharacter = await fetch(`${baseURL}/characters/${id}/full`);
                const responseJsonCharacter = await responseCharacter.json();
                setCharacter(responseJsonCharacter.data);
                
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar character: ", error);
            }
        };

        getCharacterFullByID();
    }, [id])

    if (loading) return <p>Loading...</p>

    return (
        <>
            <Header />
            <div className="character-container">
                <h1 className="character-title">{character.name}</h1>
                
                <div className="character-details">
                    <img src={character.images.jpg.image_url} alt={character.name} className="character-img" />

                    <div className="character-info">
                        <h2>Character Details</h2>
                        <p><strong>Kanji Name:</strong> {character.name_kanji}</p>
                        <p><strong>Nicknames:</strong> {character.nicknames?.join(', ') || 'None'}</p>
                        <p><strong>Favorites:</strong> {character.favorites}</p>
                        <p><strong>About:</strong></p>
                        {character.about?.split('\n').map((line, index) => (
                            <p key={index}>{decodeHTML(line)}</p>
                        ))}
                    </div>
                </div>

                <h2 className="voice-title">Voice Actors</h2>
                <div className="voice-actors-grid">
                    {character.voices?.map((actor, index) => (
                        <div key={index} className="voice-card">
                            <a href={actor.person.url}>
                                <img 
                                    src={actor.person.images.jpg.image_url} 
                                    alt={actor.person.name} 
                                    className="voice-img" 
                                />
                                <div className="voice-card-footer">
                                    <p className="voice-name">{actor.person.name}</p>
                                    <p className="voice-language">{actor.language}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
};

export default Character;
