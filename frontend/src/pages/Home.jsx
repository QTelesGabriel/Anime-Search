import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import GenreSelect from '../components/GenreSelect';
import '../styles/categorie.css';

const Home = () => {
    const API_BASE_URL = "http://localhost:8000";

    const [bestAnimes, setBestAnimes] = useState([]);
    const [genreAnimes, setGenreAnimes] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [search, setSearch] = useState('');
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');

    // Efeito para buscar dados iniciais: melhores animes e lista de gêneros
    // A lógica de persistência de gênero foi adicionada aqui
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Melhores avaliações
                const resTop = await fetch(`${API_BASE_URL}/animes/top`);
                const jsonTop = await resTop.json();
                setBestAnimes(jsonTop);

                // Lista de gêneros
                const resGenres = await fetch(`${API_BASE_URL}/animes/genres`);
                const jsonGenres = await resGenres.json();
                setGenres(jsonGenres);

                // NOVO: Verifica se há um gênero salvo no localStorage
                const storedGenre = localStorage.getItem('selectedGenre');

                if (storedGenre && jsonGenres.some(g => g.name === storedGenre)) {
                    // Se houver e for válido, usa o gênero salvo
                    setSelectedGenre(storedGenre);
                } else if (jsonGenres.length > 0) {
                    // Caso contrário, seleciona o primeiro gênero da lista
                    setSelectedGenre(jsonGenres[0].name);
                }
            } catch (error) {
                console.error('Erro ao buscar dados iniciais:', error);
            }
        };

        fetchInitialData();
    }, []);

    // Efeito para salvar o gênero selecionado no localStorage
    // Ele executa toda vez que 'selectedGenre' muda
    useEffect(() => {
        if (selectedGenre) {
            localStorage.setItem('selectedGenre', selectedGenre);
        }
    }, [selectedGenre]);

    // Buscar animes do gênero selecionado
    useEffect(() => {
        if (!selectedGenre) return;

        const fetchGenreAnimes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/animes/genre/${encodeURIComponent(selectedGenre)}`);
                const json = await res.json();
                setGenreAnimes(json);
            } catch (error) {
                console.error('Erro ao buscar animes por gênero:', error);
            }
        };

        fetchGenreAnimes();
    }, [selectedGenre]);

    const handleSearch = async () => {
        if (search.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
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
                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                    <h2 className="title">Top Animes in {selectedGenre}</h2>
                    <AnimeCarousel animes={genreAnimes} />
                </>
            ) : (
                <>
                    <h2 className="title">Best Ratings</h2>
                    <AnimeCarousel animes={bestAnimes} />
                    <GenreSelect
                        genres={genres}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                    <h2 className="title">Top Animes in {selectedGenre}</h2>
                    <AnimeCarousel animes={genreAnimes} />
                </>
            )}
        </>
    );
};

export default Home;