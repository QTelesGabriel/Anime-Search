import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import LimitInput from '../components/LimitInput';
import { useAuth } from '../context/AuthProvider';
import '../styles/categorie.css';

// Função auxiliar para carregar o valor do localStorage
const loadLimit = (key, defaultValue) => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? parseInt(storedValue, 10) : defaultValue;
    } catch (error) {
        console.error("Erro ao carregar do localStorage:", error);
        return defaultValue;
    }
};

const Profile = () => {
    const { userId } = useAuth();
    const API_BASE_URL = "http://localhost:8000";

    const [myAnimes, setMyAnimes] = useState([]);
    const [recommendedAnimes, setRecommendedAnimes] = useState([]);
    const [loadingMyList, setLoadingMyList] = useState(true);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [recommendationsLimit, setRecommendationsLimit] = useState(() => loadLimit('recommendationsLimit', 20));

    // NOVO: Efeito para salvar o limite no localStorage
    useEffect(() => {
        localStorage.setItem('recommendationsLimit', recommendationsLimit.toString());
    }, [recommendationsLimit]);

    // useEffect para buscar a lista do usuário (não precisa de limite)
    useEffect(() => {
        const fetchMyAnimes = async () => {
            if (userId) {
                setLoadingMyList(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/my-animes/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setMyAnimes(data);
                    } else {
                        console.error(`Erro ao buscar sua lista: ${response.status} ${response.statusText}`);
                        setMyAnimes([]);
                    }
                } catch (error) {
                    console.error("Erro de rede ao buscar sua lista:", error);
                    setMyAnimes([]);
                } finally {
                    setLoadingMyList(false);
                }
            } else {
                setMyAnimes([]);
                setLoadingMyList(false);
            }
        };

        fetchMyAnimes();
    }, [userId]);

    // useEffect para buscar as recomendações
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (userId) {
                setLoadingRecommendations(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/recommendations/${userId}?limit=${recommendationsLimit}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            setRecommendedAnimes(data);
                        } else {
                            console.error("A API de recomendação retornou um formato de dado inesperado:", data);
                            setRecommendedAnimes([]);
                        }
                    } else {
                        console.error(`Erro ao buscar recomendações: ${response.status} ${response.statusText}`);
                        setRecommendedAnimes([]);
                    }
                } catch (error) {
                    console.error("Erro de rede ao buscar recomendações:", error);
                    setRecommendedAnimes([]);
                } finally {
                    setLoadingRecommendations(false);
                }
            } else {
                setRecommendedAnimes([]);
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [userId, recommendationsLimit]);

    return (
        <>
            <Header />
            <div className="categorie">
                <h2 className="title">Your List</h2>
            </div>
            {loadingMyList ? (
                <h3 className='loading'>Carregando sua lista...</h3>
            ) : (
                <AnimeCarousel animes={myAnimes} storageKey={`carousel-my-list-${userId}`} />
            )}
            
            <div className="categorie">
                <h2 className="title">Recommended For You</h2>
                <LimitInput 
                    label="Show" 
                    value={recommendationsLimit}
                    onChange={setRecommendationsLimit} 
                    className="profile-limit-input"
                />
            </div>
            {loadingRecommendations ? (
                <h3 className='loading'>Carregando recomendações...</h3>
            ) : (
                <AnimeCarousel animes={recommendedAnimes} storageKey={`carousel-recommended-${userId}`} />
            )}
        </>
    );
};

export default Profile;