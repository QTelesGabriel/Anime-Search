import React from 'react';
import '../styles/animeDetails.css'

const AnimeDetails = ({ anime }) => {
    
    return (
        <div className="anime-details">
            <img src={anime.images.jpg.large_image_url} alt={anime.title} className="anime-details__img" />
            <div className="anime-details__details">
                <h2 className="detail-title">Details</h2>
                <div className="detail">
                    <h3>Name: </h3>
                    <p>{anime.title_japanese}</p>
                </div>
                <div className="detail">
                    <h3>Rank: </h3>
                    <p>#{anime.rank}</p>
                </div>
                <div className="detail">
                    <h3>Score: </h3>
                    <p>{anime.score}</p>
                </div>
                <div className="detail">
                    <h3>Episodes: </h3>
                    <p>{anime.episodes}</p>
                </div>
                <div className="detail">
                    <h3>Status: </h3>
                    <p>{anime.status}</p>
                </div>
                <div className="detail">
                    <h3>Genres: </h3>
                    <p>{anime.genres.map(g => g.name).join(', ')}</p>
                </div>
                <div className="detail">
                    <h3>Studios: </h3>
                    <p>{anime.studios.map(s => s.name).join(', ')}</p>
                </div>
                <div className="detail">
                    <h3>Season: </h3>
                    <p>{anime.season} {anime.year}</p>
                </div>
                <div className="detail">
                    <h3>Streaming: </h3>
                    <p>
                        {anime.streaming.length > 0 ? (
                            anime.streaming.map((st, index) => (
                            <React.Fragment key={st.name}>
                                <a href={st.url} target="_blank" rel="noopener noreferrer">{st.name}</a>
                                {index < anime.streaming.length - 1 ? ', ' : ''}
                            </React.Fragment>
                            ))
                        ) : (
                            'No official streaming info.'
                        )}
                    </p>
                </div>
            </div>
        </div>
    )

}

export default AnimeDetails;