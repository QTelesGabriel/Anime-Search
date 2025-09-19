import React from 'react';
import '../styles/animeTrailer.css';

const AnimeTrailer = ({ anime }) => {
    if (!anime || !anime.trailer_embed_url) {
        return <p className="no-trailer">Trailer not available.</p>;
    }

    return (
        <div className="anime-trailer">
            <iframe
                className="anime-trailer__iframe"
                src={anime.trailer_embed_url}
                title="Anime Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default AnimeTrailer;