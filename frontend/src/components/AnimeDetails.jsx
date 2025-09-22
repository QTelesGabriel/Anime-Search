import React from 'react';
import '../styles/animeDetails.css'

const AnimeDetails = ({ anime }) => {
    if (!anime) return null;

    return (
        <div className="anime-details">
            <img src={anime.image_url} alt={anime.title} className="anime-details__img" />
            <div className="anime-details__details">
                {anime.title_japanese && (
                    <div className="detail">
                        <h3>Name: </h3>
                        <p>{anime.title_japanese}</p>
                    </div>
                )}

                {anime.rank && (
                    <div className="detail">
                        <h3>Rank: </h3>
                        <p>#{anime.rank}</p>
                    </div>
                )}

                {anime.score && (
                    <div className="detail">
                        <h3>Score: </h3>
                        <p>{anime.score}</p>
                    </div>
                )}

                {anime.episodes && (
                    <div className="detail">
                        <h3>Episodes: </h3>
                        <p>{anime.episodes}</p>
                    </div>
                )}

                {anime.status && (
                    <div className="detail">
                        <h3>Status: </h3>
                        <p>{anime.status}</p>
                    </div>
                )}

                {Array.isArray(anime.genres) && anime.genres.length > 0 && (
                    <div className="detail">
                        <h3>Genres: </h3>
                        <p>{anime.genres.join(', ')}</p>
                    </div>
                )}

                {Array.isArray(anime.studios) && anime.studios.length > 0 && (
                    <div className="detail">
                        <h3>Studios: </h3>
                        <p>{anime.studios.join(', ')}</p>
                    </div>
                )}

                {(anime.season || anime.year) && (
                    <div className="detail">
                        <h3>Season: </h3>
                        <p>{anime.season || ''} {anime.year || ''}</p>
                    </div>
                )}

                <div className="detail">
                    <h3>Streaming: </h3>
                    {Array.isArray(anime.streaming) && anime.streaming.length > 0 ? (
                        <p>
                            {anime.streaming.map(service => (
                                <a key={service.name} href={service.url} target="_blank" rel="noopener noreferrer">
                                    {service.name}
                                </a>
                            )).reduce((prev, curr) => [prev, ', ', curr])}
                        </p>
                    ) : (
                        <p>No official streaming info in local database.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnimeDetails;