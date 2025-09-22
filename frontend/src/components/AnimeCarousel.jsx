import React, { useRef, useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';
import '../styles/animeCarousel.css';

/**
 * AnimeCarousel — comportamento tipo "Netflix": setas laterais que avançam/voltam uma "página"
 * - Permite swipe/touch naturalmente (overflow-x: auto)
 * - Calcula quantos itens cabem por página e faz scroll por múltiplos de itemWidth
 * - Mostra/oculta as setas conforme necessário e desabilita quando no início/fim
 */
const AnimeCarousel = ({ animes }) => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [pageScrollWidth, setPageScrollWidth] = useState(0);

  // gap em px — mantenha this value igual ao gap usado no CSS (.anime-carousel-track)
  const GAP_PX = 0;

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;

    const update = () => {
      // overflow
      setIsOverflowing(track.scrollWidth > vp.clientWidth + 1);

      // prev/next
      setCanScrollPrev(vp.scrollLeft > 0);
      setCanScrollNext(vp.scrollLeft + vp.clientWidth < track.scrollWidth - 1);

      // calcula quantos itens por página e a largura do "page scroll"
      const firstItem = track.children[0];
      const itemWidth = firstItem ? Math.round(firstItem.getBoundingClientRect().width) : 180;
      const fullItem = itemWidth + GAP_PX;
      const itemsPerPage = Math.max(1, Math.floor(vp.clientWidth / fullItem));
      setPageScrollWidth(itemsPerPage * fullItem);
    };

    update();

    const onResize = () => update();
    window.addEventListener('resize', onResize);
    vp.addEventListener('scroll', update);

    return () => {
      window.removeEventListener('resize', onResize);
      vp.removeEventListener('scroll', update);
    };
  }, [animes]);

  const scrollByPage = (dir = 1) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const amount = pageScrollWidth || vp.clientWidth; // fallback
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
      {/* Left arrow */}
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

      {/* Viewport (pode dar scroll com touch) */}
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

      {/* Right arrow */}
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