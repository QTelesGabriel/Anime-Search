import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import AnimeCard from './AnimeCard';
import '../styles/animeCarousel.css';

/**
 * AnimeCarousel
 * Agora com persistência de posição usando localStorage
 */
const AnimeCarousel = ({ animes, storageKey }) => { 
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  
  // Usamos um ref para o timeout do save para não causar re-renders desnecessários
  const saveTimeoutRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [pageScrollWidth, setPageScrollWidth] = useState(0);

  const GAP_PX = 0; // Mantenha igual ao CSS

  // 1. Restaurar a posição (useLayoutEffect evita "piscada" visual)
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (vp && storageKey && animes && animes.length > 0) {
      const savedPosition = localStorage.getItem(`carousel_pos_${storageKey}`);
      if (savedPosition) {
        // Pequeno timeout para garantir que o DOM renderizou a largura correta
        setTimeout(() => {
            vp.scrollLeft = parseInt(savedPosition, 10);
        }, 0);
      }
    }
  }, [animes, storageKey]);

  // 2. Configurar lógica de scroll e listeners
  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;

    const update = () => {
      setIsOverflowing(track.scrollWidth > vp.clientWidth + 1);
      setCanScrollPrev(vp.scrollLeft > 0);
      setCanScrollNext(vp.scrollLeft + vp.clientWidth < track.scrollWidth - 1);

      const firstItem = track.children[0];
      const itemWidth = firstItem ? Math.round(firstItem.getBoundingClientRect().width) : 180;
      const fullItem = itemWidth + GAP_PX;
      const itemsPerPage = Math.max(1, Math.floor(vp.clientWidth / fullItem));
      setPageScrollWidth(itemsPerPage * fullItem);
    };

    // Roda update inicial
    update();

    const onResize = () => update();

    const onScroll = () => {
      update();

      // 3. Salvar posição no localStorage (com Debounce para performance)
      if (storageKey) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        // Só salva se o usuário parar de scrollar por 100ms
        saveTimeoutRef.current = setTimeout(() => {
          localStorage.setItem(`carousel_pos_${storageKey}`, vp.scrollLeft);
        }, 100);
      }
    };

    window.addEventListener('resize', onResize);
    vp.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onResize);
      vp.removeEventListener('scroll', onScroll);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [animes, storageKey]);

  const scrollByPage = (dir = 1) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const amount = pageScrollWidth || vp.clientWidth;
    vp.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByPage(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByPage(1);
    }
  };

  if (!animes || animes.length === 0) {
    return <h3 className="loading">Não há animes para mostrar</h3>;
  }

  return (
    <div className="anime-carousel-wrapper">
      {isOverflowing && (
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollPrev}
          aria-label="Anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div
        className="anime-carousel-viewport"
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Carrossel de animes"
      >
        <div className="anime-carousel-track" ref={trackRef}>
          {animes.map((anime) => (
            <div className="anime-carousel-item" key={anime.mal_id}>
              <AnimeCard
                title={anime.title}
                image={anime.image_url}
                id={anime.mal_id}
              />
            </div>
          ))}
        </div>
      </div>

      {isOverflowing && (
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollNext}
          aria-label="Próximo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AnimeCarousel;