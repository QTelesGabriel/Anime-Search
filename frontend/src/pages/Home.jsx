import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import '../styles/categorie.css';

const Home = () => {
    const API_BASE_URL = "http://localhost:8000";

    const [bestAnimes, setBestAnimes] = useState([]);
    const [popularAnimes, setPopularAnimes] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAnimes = async () => {
            try {
                // Requisição para o seu backend para as melhores avaliações
                const resTop = await fetch(`${API_BASE_URL}/animes/top`);
                const jsonTop = await resTop.json();
                setBestAnimes(jsonTop); // Assumindo que a resposta já é a lista de animes

                // Requisição para o seu backend para os mais populares
                const resPopular = await fetch(`${API_BASE_URL}/animes/popular`);
                const jsonPopular = await resPopular.json();
                setPopularAnimes(jsonPopular); // Assumindo que a resposta já é a lista de animes
            } catch (error) {
                console.error('Erro ao buscar animes:', error);
            }
        };

        fetchAnimes();
    }, []);

    const handleSearch = async () => {
        if (search.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            // Requisição para o seu backend para a busca
            const res = await fetch(`${API_BASE_URL}/animes/search?q=${encodeURIComponent(search)}`);
            const json = await res.json();
            setSearchResults(json);
        } catch (error) {
            console.error('Erro ao buscar animes:', error);
        }
    };

    return (
        <>
            <Header />
            <SearchBar 
                search={search} 
                setSearch={setSearch} 
                onSearch={handleSearch} 
            />

            {searchResults.length > 0 ? (
                <>
                    <h2 className="title">Search Results for: '{search}'</h2>
                    <AnimeCarousel animes={searchResults} />
                    <h2 className="title">Best Ratings</h2>
                    <AnimeCarousel animes={bestAnimes} />
                    <h2 className="title">Most Popular</h2>
                    <AnimeCarousel animes={popularAnimes} />
                </>
            ) : (
                <>
                    <h2 className="title">Best Ratings</h2>
                    <AnimeCarousel animes={bestAnimes} />
                    <h2 className="title">Most Popular</h2>
                    <AnimeCarousel animes={popularAnimes} />
                </>
            )}
        </>
    );
};

export default Home;