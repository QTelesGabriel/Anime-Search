import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/character.css';

// Função para formatar a data de nascimento
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const [datePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'N/A';
    }
};

const Character = () => {
    const { id } = useParams();
    const API_BASE_URL = "http://localhost:8000";

    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);

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
                        <p><strong>Kanji Name:</strong> {character.name_kanji || 'N/A'}</p>
                        <p><strong>Nicknames:</strong> {character.nicknames || 'N/A'}</p>
                        <p><strong>Favorites:</strong> {character.favorites || 'N/A'}</p>
                    </div>
                </div>

                <h2 className="section-title">About the Character</h2>
                <div className="about-content" dangerouslySetInnerHTML={{ __html: character.about?.replace(/\\n/g, '<br/>') || 'N/A' }}></div>

                {character.pictures && character.pictures.length > 0 && (
                    <>
                        <h2 className="section-title">Pictures</h2>
                        <div className="character-pictures-grid">
                            {character.pictures.map((pic, index) => (
                                <a key={index} href={pic} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={pic} 
                                        alt={`${character.name} picture ${index}`} 
                                        className="character-pic" 
                                    />
                                </a>
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
                                <p><strong>Birthday:</strong> {formatDate(actor.birthday)}</p>
                                <p><strong>About:</strong></p>
                                <div className="about-content" dangerouslySetInnerHTML={{ __html: actor.about?.replace(/\\n/g, '<br/>') || 'N/A' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Character;