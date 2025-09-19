import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/character.css';

const Character = () => {
    const { id } = useParams();
    const API_BASE_URL = "http://localhost:8000"; // Seu backend

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
                const response = await fetch(`${API_BASE_URL}/character/${id}`);
                const responseData = await response.json();

                if (response.ok) {
                    setCharacter(responseData);
                } else {
                    console.error("Erro ao buscar character:", responseData.detail);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Erro de rede ao buscar character: ", error);
                setLoading(false);
            }
        };

        getCharacterFullByID();
    }, [id]);

    if (loading) return <p>Loading...</p>;

    if (!character) return <p>Character not found.</p>;

    return (
        <>
            <Header />
            <div className="character-container">
                <h1 className="character-title">{character.name}</h1>
                
                <div className="character-details">
                    <img src={character.image_url} alt={character.name} className="character-img" />

                    <div className="character-info">
                        <h2>Character Details</h2>
                        <p><strong>Favorites:</strong> {character.favorites || 'N/A'}</p>
                        <p><strong>About:</strong></p>
                        {/* * Use dangerouslySetInnerHTML para renderizar o HTML da biografia
                          * Isso é seguro porque o dado vem da API Jikan e não de um usuário
                        */}
                        <div dangerouslySetInnerHTML={{ __html: character.about?.replace(/\\n/g, '<br/>') || 'N/A' }}></div>
                    </div>
                </div>

                {/* * --- 
                  * Nova seção para as fotos do personagem
                  * --- 
                */}
                {character.pictures && character.pictures.length > 0 && (
                    <>
                        <h2 className="section-title">Pictures</h2>
                        <div className="character-pictures-grid">
                            {character.pictures.map((pic, index) => (
                                <img key={index} src={pic.image_url} alt={`${character.name} picture ${index}`} className="character-pic" />
                            ))}
                        </div>
                    </>
                )}
                
                <h2 className="section-title">Voice Actors</h2>
                <div className="voice-actors-grid">
                    {character.voice_actors?.map((actor, index) => (
                        <div key={index} className="voice-card">
                            <a href={`/voice-actor/${actor.mal_id}`}>
                                <img 
                                    src={actor.image_url} 
                                    alt={actor.name} 
                                    className="voice-img" 
                                />
                                <div className="voice-card-footer">
                                    <p className="voice-name">{actor.name}</p>
                                    <p className="voice-language">{actor.language}</p>
                                </div>
                            </a>
                            <div className="voice-actor-details">
                                <p><strong>Birthday:</strong> {actor.birthday || 'N/A'}</p>
                                <p><strong>About:</strong></p>
                                <div dangerouslySetInnerHTML={{ __html: actor.about?.replace(/\\n/g, '<br/>') || 'N/A' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Character;