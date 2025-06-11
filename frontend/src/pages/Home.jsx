import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import '../styles/categorie.css';

const Home = () => {
    const [bestAnimes, setBestAnimes] = useState([]);
    const [popularAnimes, setPopularAnimes] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAnimes = async () => {
            try {
                const resTop = await fetch('https://api.jikan.moe/v4/top/anime?limit=20');
                const jsonTop = await resTop.json();
                setBestAnimes(jsonTop.data);

                await new Promise(resolve => setTimeout(resolve, 500));

                const resPopular = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20');
                const jsonPopular = await resPopular.json();
                setPopularAnimes(jsonPopular.data);

            } catch (error) {
                console.error('Erro ao buscar animes: ', error);
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
            const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=25`);
            const json = await res.json();
            setSearchResults(json.data);
        } catch (error) {
            console.error('Erro ao buscar anime:', error);
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
