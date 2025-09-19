import React from 'react';
import '../styles/animeDetails.css'

const AnimeDetails = ({ anime }) => {
    // Tratamento de segurança caso o objeto anime não exista
    if (!anime) return null;

    return (
        <div className="anime-details">
            <img src={anime.image_url} alt={anime.title} className="anime-details__img" />
            <div className="anime-details__details">
                <h2 className="detail-title">Details</h2>
                <div className="detail">
                    <h3>Name: </h3>
                    <p>{anime.title_japanese || 'N/A'}</p>
                </div>
                <div className="detail">
                    <h3>Rank: </h3>
                    <p>#{anime.rank || 'N/A'}</p>
                </div>
                <div className="detail">
                    <h3>Score: </h3>
                    <p>{anime.score || 'N/A'}</p>
                </div>
                <div className="detail">
                    <h3>Episodes: </h3>
                    <p>{anime.episodes || 'N/A'}</p>
                </div>
                <div className="detail">
                    <h3>Status: </h3>
                    <p>{anime.status || 'N/A'}</p>
                </div>
                <div className="detail">
                    <h3>Genres: </h3>
                    {/* Alterado para verificar se anime.genres é um array antes de usar .join() */}
                    <p>{(Array.isArray(anime.genres) ? anime.genres.join(', ') : 'N/A')}</p>
                </div>
                <div className="detail">
                    <h3>Studios: </h3>
                    {/* Alterado para verificar se anime.studios é um array antes de usar .join() */}
                    <p>{(Array.isArray(anime.studios) ? anime.studios.join(', ') : 'N/A')}</p>
                </div>
                <div className="detail">
                    <h3>Season: </h3>
                    <p>{anime.season || 'N/A'} {anime.year || ''}</p>
                </div>
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