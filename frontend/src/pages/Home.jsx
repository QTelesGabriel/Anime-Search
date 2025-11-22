import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import GenreSelect from '../components/GenreSelect';
import LimitInput from '../components/LimitInput';
import '../styles/categorie.css';
import '../styles/limitInput.css';

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
    
    // Estado inicial da busca
    const [search, setSearch] = useState(() => localStorage.getItem('animeSearch') || '');
    const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('animeSearch') || '');
    
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');

    // Limites
    const [topAnimesLimit, setTopAnimesLimit] = useState(() => loadLimit('topAnimesLimit', 20));
    const [genreAnimesLimit, setGenreAnimesLimit] = useState(() => loadLimit('genreAnimesLimit', 20));
    const [searchResultsLimit, setSearchResultsLimit] = useState(() => loadLimit('searchResultsLimit', 25));

    // Persistência dos limites
    useEffect(() => { localStorage.setItem('topAnimesLimit', topAnimesLimit.toString()); }, [topAnimesLimit]);
    useEffect(() => { localStorage.setItem('genreAnimesLimit', genreAnimesLimit.toString()); }, [genreAnimesLimit]);
    useEffect(() => { localStorage.setItem('searchResultsLimit', searchResultsLimit.toString()); }, [searchResultsLimit]);

    // Carregamento inicial (Top Animes + Generos + Busca Salva)
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
                
                const savedSearch = localStorage.getItem('animeSearch');
                if (savedSearch) {
                    setSearchTerm(savedSearch);
                    setSearch(savedSearch);
                    // Não chamamos handleSearch aqui para evitar loop ou dupla chamada, 
                    // o useEffect de [searchTerm] cuidará disso se necessário ou chamada direta.
                }
                
            } catch (error) {
                console.error('Erro ao buscar dados iniciais:', error);
            }
        };
        fetchInitialData();
    }, [topAnimesLimit]); // Dependência apenas do limite para recarregar se ele mudar
    
    // Persistência do gênero
    useEffect(() => { if (selectedGenre) localStorage.setItem('selectedGenre', selectedGenre); }, [selectedGenre]);
    
    // Executa a busca quando searchTerm ou limite mudam
    useEffect(() => {
        const fetchSearchResults = async () => {
            const searchValue = searchTerm.trim();
            if (searchValue) {
                try {
                    const res = await fetch(`${API_BASE_URL}/animes/search?q=${encodeURIComponent(searchValue)}&limit=${searchResultsLimit}`);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    
                    const json = await res.json();
                    setSearchResults(json);
                    localStorage.setItem('animeSearch', searchValue);
                } catch (error) {
                    console.error('Erro ao buscar animes:', error);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
                localStorage.removeItem('animeSearch');
            }
        };

        // Só busca se houver termo (evita buscar vazio na montagem se não tiver nada salvo)
        if (searchTerm) fetchSearchResults();

    }, [searchTerm, searchResultsLimit]);

    // Busca por Gênero
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

    const handleSearch = (term) => {
        const searchValue = term.trim();
        setSearchTerm(searchValue); // Isso disparará o useEffect da busca
        if (!searchValue) {
            setSearchResults([]);
            localStorage.removeItem('animeSearch');
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
                    <div className="title-container">
                        <h2 className="title">Search Results for: '{searchTerm}'</h2>
                        <LimitInput label="Show" value={searchResultsLimit} onChange={setSearchResultsLimit} />
                    </div>
                    <AnimeCarousel 
                        animes={searchResults} 
                        storageKey="carousel-search-results" 
                    />

                    <div className="title-container">
                        <h2 className="title">Best Ratings</h2>
                        <LimitInput label="Show" value={topAnimesLimit} onChange={setTopAnimesLimit} />
                    </div>
                    <AnimeCarousel 
                        animes={bestAnimes} 
                        storageKey="carousel-best-animes" 
                    />

                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />

                    <div className="title-container">
                        <h2 className="title">Top Animes in {selectedGenre}</h2>
                        <LimitInput label="Show" value={genreAnimesLimit} onChange={setGenreAnimesLimit} />
                    </div>
                    <AnimeCarousel 
                        animes={genreAnimes} 
                        storageKey={`carousel-genre-${selectedGenre}`} 
                    />
                </>
            ) : (
                <>
                    <div className="categorie">
                        <h2 className="title">Best Ratings</h2>
                        <LimitInput label="Show" value={topAnimesLimit} onChange={setTopAnimesLimit} />
                    </div>
                    <AnimeCarousel 
                        animes={bestAnimes} 
                        storageKey="carousel-best-animes" 
                    />

                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />

                    <div className="categorie">
                        <h2 className="title">Top Animes in {selectedGenre}</h2>
                        <LimitInput label="Show" value={genreAnimesLimit} onChange={setGenreAnimesLimit} />
                    </div>
                    <AnimeCarousel 
                        animes={genreAnimes} 
                        storageKey={`carousel-genre-${selectedGenre}`} 
                    />
                </>
            )}
        </>
    );
};

export default Home;