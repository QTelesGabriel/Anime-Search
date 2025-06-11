import React from 'react';
import '../styles/animeTrailer.css';

const AnimeTrailer = ({ anime }) => {

    return (
    <div className="anime-trailer">
        <iframe
            className="anime-trailer__iframe"
            src={anime?.trailer.embed_url}
            title="Anime Trailer"
            frameBorder="0"
            allowFullScreen
        ></iframe>
    </div>
);
};

export default AnimeTrailer;
