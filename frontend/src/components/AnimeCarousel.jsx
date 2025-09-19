import React from 'react';
import AnimeCard from './AnimeCard';
import '../styles/animeCarousel.css'

const AnimeCarousel = ({ animes }) => {
    // Adicionado um retorno se não houver animes para evitar erros de renderização
    if (!animes || animes.length === 0) {
        return <p className='loading'>Carregando...</p>;
    }

    return (
        <>
            <div className="anime-carousel-container">
                <div className="anime-carousel">
                    {animes.map((anime) => (
                        <AnimeCard
                            key={anime.mal_id} // Chave única é o mal_id
                            title={anime.title}
                            image={anime.image_url}
                            id={anime.mal_id}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default AnimeCarousel;