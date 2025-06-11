import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import AnimeDetails from '../components/AnimeDetails';
import AnimeSynopsis from '../components/AnimeSynopsis';
import AnimeTrailer from '../components/AnimeTrailer';
import AnimeCharacters from '../components/AnimeCharacters';
import '../styles/anime.css'

const Anime = () => {

    const { id } = useParams();
    const baseURL = "https://api.jikan.moe/v4"

    const [anime, setAnime] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAnimeFullByID = async () => {
            try {
                const responseAnime = await fetch(`${baseURL}/anime/${id}/full`);
                const responseJsonAnime = await responseAnime.json();
                setAnime(responseJsonAnime.data);

                const responseCharacters = await fetch(`${baseURL}/anime/${id}/characters`);
                const responseJsonCharacters = await responseCharacters.json();
                setCharacters(responseJsonCharacters.data)
                
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar anime: ", error);
            }
        };

        getAnimeFullByID();
    }, [id])

    if (loading) return <p>Loading...</p>

    return (
        <>
            <Header />
            <div className="anime-container">
                <h2 className="anime-info">{anime?.title}</h2>
                <AnimeDetails anime={anime} />
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
