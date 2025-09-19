import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import AnimeDetails from '../components/AnimeDetails';
import AnimeSynopsis from '../components/AnimeSynopsis';
import AnimeTrailer from '../components/AnimeTrailer';
import AnimeCharacters from '../components/AnimeCharacters';
import { useAuth } from '../context/AuthProvider'; // Importa o contexto de autenticação
import '../styles/anime.css'

const Anime = () => {
    const { id } = useParams();
    const API_BASE_URL = "http://localhost:8000"; // Seu backend
    const { userId } = useAuth(); // Obtém o userId do contexto

    const [anime, setAnime] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const getAnimeData = async () => {
            try {
                // A requisição agora busca todos os dados do seu backend
                const response = await fetch(`${API_BASE_URL}/anime/${id}`);
                const responseData = await response.json();

                if (response.ok) {
                    setAnime(responseData);
                    setCharacters(responseData.characters); // Assumindo que o backend retorna os personagens
                } else {
                    console.error("Erro ao buscar dados do anime:", responseData.detail);
                }
            } catch (error) {
                console.error("Erro de rede ao buscar anime: ", error);
            } finally {
                setLoading(false);
            }
        };

        getAnimeData();
    }, [id]);

    const handleRateAnime = async (rating) => {
        if (!userId) {
            alert("Você precisa estar logado para avaliar um anime.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rate-anime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    anime_id: parseInt(id),
                    rating: rating
                }),
            });
            const responseData = await response.json();
            if (response.ok) {
                alert(responseData.message);
                setUserRating(rating); // Atualiza o estado da avaliação no frontend
            } else {
                alert("Erro ao salvar avaliação: " + responseData.detail);
            }
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            alert("Erro de rede ao enviar avaliação.");
        }
    };

    if (loading) return <p>Loading...</p>

    return (
        <>
            <Header />
            <div className="anime-container">
                <h2 className="anime-info">{anime?.title}</h2>
                <AnimeDetails anime={anime} />
                
                {/* Botões de avaliação */}
                <div className="rating-section">
                    <h3>Rate this Anime</h3>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => handleRateAnime(rating)}
                            className={`rating-button ${rating === userRating ? 'selected' : ''}`}
                        >
                            {rating}
                        </button>
                    ))}
                </div>

                <h2 className="anime-info">Synopsis</h2>
                <AnimeSynopsis anime={anime} />
                <h2 className="anime-info">Trailer</h2>
                <AnimeTrailer anime={anime} />
                <h2 className="anime-info">Characters</h2>
                <AnimeCharacters characters={characters} />
            </div>
        </>
    );
};

export default Anime;