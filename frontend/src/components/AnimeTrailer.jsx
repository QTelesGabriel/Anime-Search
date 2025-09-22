import React from 'react';
import '../styles/animeTrailer.css';

const AnimeTrailer = ({ anime }) => {
    // Tratamento de segurança caso o objeto anime não exista ou o trailer não esteja disponível
    if (!anime || !anime.trailer_embed_url) {
        return <p className="no-trailer">Trailer not available.</p>;
    }

    // Adiciona o parâmetro '?autoplay=0' para evitar a reprodução automática
    const trailerUrl = `${anime.trailer_embed_url}?autoplay=0`;

    return (
        <div className="anime-trailer">
            <iframe
                className="anime-trailer__iframe"
                src={trailerUrl} // Usa a URL com o parâmetro de autoplay
                title="Anime Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default AnimeTrailer;