import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/voiceActor.css';

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

const VoiceActor = () => {
    const { id } = useParams();
    const API_BASE_URL = "http://localhost:8000";

    const [voiceActor, setVoiceActor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getVoiceActorDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/voice-actor/${id}`);
                const responseData = await response.json();

                if (response.ok) {
                    setVoiceActor(responseData);
                } else {
                    console.error("Erro ao buscar dublador:", responseData.detail);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Erro de rede ao buscar dublador: ", error);
                setLoading(false);
            }
        };

        getVoiceActorDetails();
    }, [id]);

    if (loading) return <p>Loading...</p>;

    if (!voiceActor) return <p>Voice Actor not found.</p>;

    return (
        <>
            <Header />
            <div className="voice-actor-container">
                <h1 className="voice-actor-title">{voiceActor.name}</h1>
                
                <div className="voice-actor-details">
                    <img src={voiceActor.image_url} alt={voiceActor.name} className="voice-actor-img" />

                    <div className="voice-actor-info">
                        <h2>Voice Actor Details</h2>
                        <p><strong>Birthday:</strong> {formatDate(voiceActor.birthday)}</p>
                        <p><strong>About:</strong></p>
                        <div className="about-content" dangerouslySetInnerHTML={{ __html: voiceActor.about?.replace(/\\n/g, '<br/>') || 'N/A' }}></div>
                    </div>
                </div>

                <h2 className="section-title">Characters</h2>
                <div className="characters-grid">
                    {voiceActor.characters?.map((character, index) => (
                        <div key={index} className="character-card">
                            <a href={`/character/${character.mal_id}`}>
                                <img 
                                    src={character.image_url} 
                                    alt={character.name} 
                                    className="character-img-grid" 
                                />
                                <div className="character-card-footer">
                                    <p className="character-name-grid">{character.name}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default VoiceActor;