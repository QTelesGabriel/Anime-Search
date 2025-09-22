import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import GenreSelect from '../components/GenreSelect';
import LimitInput from '../components/LimitInput';
import '../styles/categorie.css';
import '../styles/LimitInput.css';

const loadLimit = (key, defaultValue) => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? parseInt(storedValue, 10) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
};

const Home = () => {
    const API_BASE_URL = 'http://localhost:8000';

    const [bestAnimes, setBestAnimes] = useState([]);
    const [genreAnimes, setGenreAnimes] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');

    const [topAnimesLimit, setTopAnimesLimit] = useState(() => loadLimit('topAnimesLimit', 20));
    const [genreAnimesLimit, setGenreAnimesLimit] = useState(() => loadLimit('genreAnimesLimit', 20));
    const [searchResultsLimit, setSearchResultsLimit] = useState(() => loadLimit('searchResultsLimit', 25));

    useEffect(() => { localStorage.setItem('topAnimesLimit', topAnimesLimit.toString()); }, [topAnimesLimit]);
    useEffect(() => { localStorage.setItem('genreAnimesLimit', genreAnimesLimit.toString()); }, [genreAnimesLimit]);
    useEffect(() => { localStorage.setItem('searchResultsLimit', searchResultsLimit.toString()); }, [searchResultsLimit]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const resTop = await fetch(`${API_BASE_URL}/animes/top?limit=${topAnimesLimit}`);
                setBestAnimes(await resTop.json());

                const resGenres = await fetch(`${API_BASE_URL}/animes/genres`);
                const jsonGenres = await resGenres.json();
                setGenres(jsonGenres);

                const storedGenre = localStorage.getItem('selectedGenre');
                if (storedGenre && jsonGenres.some(g => g.name === storedGenre)) {
                    setSelectedGenre(storedGenre);
                } else if (jsonGenres.length > 0) {
                    setSelectedGenre(jsonGenres[0].name);
                }

                // Carrega pesquisa salva
                const savedSearch = localStorage.getItem('animeSearch');
                if (savedSearch) {
                    setSearchTerm(savedSearch);
                    setSearch(savedSearch);
                    handleSearch(savedSearch);
                }

            } catch (error) {
                console.error('Erro ao buscar dados iniciais:', error);
            }
        };
        fetchInitialData();
    }, [topAnimesLimit]);

    useEffect(() => { if (selectedGenre) localStorage.setItem('selectedGenre', selectedGenre); }, [selectedGenre]);

    useEffect(() => {
        if (!selectedGenre) return;
        const fetchGenreAnimes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/animes/genre/${encodeURIComponent(selectedGenre)}?limit=${genreAnimesLimit}`);
                setGenreAnimes(await res.json());
            } catch (error) {
                console.error('Erro ao buscar animes por gênero:', error);
            }
        };
        fetchGenreAnimes();
    }, [selectedGenre, genreAnimesLimit]);

    const handleSearch = async (term = null) => {
        const searchValue = term !== null ? term : search.trim();
        if (searchValue === '') {
            setSearchResults([]);
            setSearchTerm('');
            localStorage.removeItem('animeSearch');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/animes/search?q=${encodeURIComponent(searchValue)}&limit=${searchResultsLimit}`);
            const json = await res.json();
            setSearchResults(json);
            setSearchTerm(searchValue);
            localStorage.setItem('animeSearch', searchValue);
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
                onSearch={() => handleSearch()}
            />

            {searchResults.length > 0 ? (
                <>
                    <div className="title-container">
                        <h2 className="title">Search Results for: '{searchTerm}'</h2>
                        <LimitInput label="Show" value={searchResultsLimit} onChange={setSearchResultsLimit} />
                    </div>
                    <AnimeCarousel animes={searchResults} />

                    <div className="title-container">
                        <h2 className="title">Best Ratings</h2>
                        <LimitInput label="Show" value={topAnimesLimit} onChange={setTopAnimesLimit} />
                    </div>
                    <AnimeCarousel animes={bestAnimes} />

                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                    <div className="title-container">
                        <h2 className="title">Top Animes in {selectedGenre}</h2>
                        <LimitInput label="Show" value={genreAnimesLimit} onChange={setGenreAnimesLimit} />
                    </div>
                    <AnimeCarousel animes={genreAnimes} />
                </>
            ) : (
                <>
                    <div className="categorie">
                        <h2 className="title">Best Ratings</h2>
                        <LimitInput label="Show" value={topAnimesLimit} onChange={setTopAnimesLimit} />
                    </div>
                    <AnimeCarousel animes={bestAnimes} />

                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                    <div className="categorie">
                        <h2 className="title">Top Animes in {selectedGenre}</h2>
                        <LimitInput label="Show" value={genreAnimesLimit} onChange={setGenreAnimesLimit} />
                    </div>
                    <AnimeCarousel animes={genreAnimes} />
                </>
            )}
        </>
    );
};

export default Home;
