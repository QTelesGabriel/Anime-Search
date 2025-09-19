import React from 'react';
import '../styles/genreSelect.css';

const GenreSelect = ({ genres, selectedGenre, setSelectedGenre }) => {

    const handleChange = (e) => {
        setSelectedGenre(e.target.value);
    };

    return (
        <div className="genre-select">
            <select
                value={selectedGenre}
                onChange={handleChange}
                className="genre-select__dropdown"
            >
                <option value="">Selecione um gênero</option>
                {genres.map((genre) => (
                    <option key={genre.mal_id} value={genre.name}>
                        {genre.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default GenreSelect;
