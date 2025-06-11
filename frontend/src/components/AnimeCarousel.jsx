import React from 'react';
import AnimeCard from './AnimeCard';
import '../styles/animeCarousel.css'

const AnimeCarousel = ({ animes }) => {
    if (!animes || animes.length === 0) return <p className='loading'>Loading...</p>;

    return (
        <>
            <div className="anime-carousel-container">
            	<div className="anime-carousel">
					{animes.map((anime, index) => (
					<AnimeCard key={index} title={anime?.title} image={anime?.images.jpg.large_image_url} id={anime?.mal_id} />
					))}
            	</div>
			</div>
		</>
	)
}


export default AnimeCarousel;