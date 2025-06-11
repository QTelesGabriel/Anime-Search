import React from 'react';
import '../styles/searchBar.css'

const SearchBar = ({ search, setSearch, onSearch }) => {
    return (
        <div className="search-bar">
            <input
                type='text'
                placeholder='Type the name of the anime'
                className="search-bar__input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button
                className="search-bar__button"
                onClick={onSearch}
            >
                Search
            </button>
        </div>
    )
}

export default SearchBar