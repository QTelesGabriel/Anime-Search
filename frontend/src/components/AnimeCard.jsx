import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animeCard.css'

const AnimeCard = ({ title, image, id }) => {
    return (
        <div className="anime-card">
            <Link to={`/anime/${id}`}>
                <img src={image} alt={title} className="anime-card__image" />
                <p className="anime-card__title">{title}</p>
            </Link>
        </div>
    )
}

export default AnimeCard;