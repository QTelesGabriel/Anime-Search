import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import '../styles/categorie.css';
import { useAuth } from '../context/AuthProvider';

const Profile = () => {
    const { userId } = useAuth();
    const API_BASE_URL = "http://localhost:8000";

    const [myAnimes, setMyAnimes] = useState([]);
    const [recommendedAnimes, setRecommendedAnimes] = useState([]);
    const [loadingMyList, setLoadingMyList] = useState(true);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);

    // useEffect para buscar a lista do usuário
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
                    const response = await fetch(`${API_BASE_URL}/recommendations/${userId}`);
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
    }, [userId]);

    return (
        <>
            <Header />
            <SearchBar />
            <div className="categorie">
                <h2 className="title">Your List</h2>
                <div className="options">
                    <Link to='/' className="option">Add Anime to List</Link>
                    <Link to='/' className="option">Filter Anime List</Link>
                </div>
            </div>
            {loadingMyList ? (
                <p className='loading'>Carregando sua lista...</p>
            ) : (
                <AnimeCarousel animes={myAnimes} />
            )}
            
            <div className="categorie">
                <h2 className="title">Recommended For You</h2>
                <Link to='/' className="option">Filter Recommendations</Link>
            </div>
            {loadingRecommendations ? (
                <p className='loading'>Carregando recomendações...</p>
            ) : (
                <AnimeCarousel animes={recommendedAnimes} />
            )}
        </>
    );
};

export default Profile;