import React, { useState, useEffect, useRef } from 'react';
import '../styles/searchBar.css';

const SearchBar = ({ search, setSearch, onSearch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Buscar sugestões automaticamente
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
        setSuggestions([]);
        return;
    }

    const debounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/animes/autocomplete?q=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    // Pressionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSuggestions([]);
            if (onSearch) onSearch(search); // passa o valor atual do input
        }
    };

    // Selecionar sugestão clicando
    const handleSelect = (title) => {
        setSearch(title);
        setSuggestions([]);
        onSearch(title);
    };

  return (
    <div className="search-bar" ref={containerRef}>
      <input
        type="text"
        placeholder="Type the name of the anime"
        className="search-bar__input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Lista de autocomplete */}
      {suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((anime) => (
            <li
              key={anime.mal_id}
              className="autocomplete-item"
              onClick={() => handleSelect(anime.title)}
            >
              <img
                src={anime.image_url}
                alt={anime.title}
                className="autocomplete-img"
              />
              <span>{anime.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
