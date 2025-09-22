import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import AnimeDetails from '../components/AnimeDetails';
import AnimeSynopsis from '../components/AnimeSynopsis';
import AnimeTrailer from '../components/AnimeTrailer';
import AnimeCharacters from '../components/AnimeCharacters';
import { useAuth } from '../context/AuthProvider';
import '../styles/anime.css'

const Anime = () => {
    const { id } = useParams();
    const API_BASE_URL = "http://localhost:8000";
    const { userId } = useAuth();

    const [anime, setAnime] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [isAddedToList, setIsAddedToList] = useState(false);

    useEffect(() => {
        const getAnimeData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/anime/${id}`);
                const responseData = await response.json();

                if (response.ok) {
                    setAnime(responseData);
                    setCharacters(responseData.characters);
                } else {
                    console.error("Erro ao buscar dados do anime:", responseData.detail);
                }

                if (userId) {
                    const listStatusRes = await fetch(`${API_BASE_URL}/user-list-status/${userId}/${id}`);
                    if (listStatusRes.ok) {
                        const listData = await listStatusRes.json();
                        setIsAddedToList(listData.is_in_list);
                    }

                    const ratingRes = await fetch(`${API_BASE_URL}/user-rating/${userId}/${id}`);
                    if (ratingRes.ok) {
                        const ratingData = await ratingRes.json();
                        setUserRating(ratingData.rating);
                    }
                }
            } catch (error) {
                console.error("Erro de rede ao buscar dados do anime: ", error);
            } finally {
                setLoading(false);
            }
        };

        getAnimeData();
    }, [id, userId]);

    // NOVO: Função que gerencia o estado do botão
    const handleManageList = async () => {
        if (!userId) {
            alert("Você precisa estar logado para gerenciar sua lista.");
            return;
        }

        let response;
        if (isAddedToList) {
            // Se já está na lista, tenta remover
            response = await fetch(`${API_BASE_URL}/remove-from-list/${userId}/${id}`, {
                method: 'DELETE',
            });
        } else {
            // Se não está na lista, tenta adicionar
            response = await fetch(`${API_BASE_URL}/add-to-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, anime_id: parseInt(id) }),
            });
        }

        const responseData = await response.json();
        if (response.ok) {
            alert(responseData.message);
            setIsAddedToList(!isAddedToList); // Inverte o estado
            setUserRating(0);
        } else {
            alert("Erro: " + responseData.detail);
        }
    };
    
    const handleRateAnime = async (rating) => {
        if (!userId) {
            alert("Você precisa estar logado para avaliar um anime.");
            return;
        }

        try {
            // Se o usuário clicar na mesma nota, remover a nota
            if (rating === userRating) {
                const response = await fetch(`${API_BASE_URL}/remove-rating/${userId}/${id}`, {
                    method: 'DELETE',
                });
                const responseData = await response.json();
                if (response.ok) {
                    alert(responseData.message);
                    setUserRating(0); // Reseta o estado para "sem nota"
                } else {
                    alert("Erro ao remover nota: " + responseData.detail);
                }
                return;
            }

            // Caso contrário, salvar a nova avaliação
            const response = await fetch(`${API_BASE_URL}/rate-anime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    anime_id: parseInt(id),
                    rating: rating,
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                alert(responseData.message);
                setUserRating(rating);
                setIsAddedToList(true);
            } else {
                alert("Erro ao salvar avaliação: " + responseData.detail);
            }
        } catch (error) {
            console.error("Erro ao enviar/remover avaliação:", error);
            alert("Erro de rede ao enviar/remover avaliação.");
        }
    };

    if (loading) return <p>Loading...</p>

    return (
        <>
            <Header />
            <div className="anime-container">
                <h2 className="anime-info">{anime?.title}</h2>
                <AnimeDetails anime={anime} />
                
                <div className="user-interaction-section">
                    <div className="add-to-list-container">
                        <button
                            className={`add-to-list-button ${isAddedToList ? 'added' : ''}`}
                            onClick={handleManageList}
                            disabled={!userId}
                        >
                            {isAddedToList ? 'Remove from list' : 'Add to list'}
                        </button>
                    </div>

                    <div className="rating-section">
                        <h3>Rate this Anime</h3>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => handleRateAnime(rating)}
                                className={`rating-button ${rating === userRating ? 'selected' : ''}`}
                                disabled={!userId}
                            >
                                {rating}
                            </button>
                        ))}
                    </div>
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