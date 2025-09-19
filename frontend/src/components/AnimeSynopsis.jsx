import React, { useState } from 'react';
import '../styles/animeSynopsis.css'

const AnimeSynopsis = ({ anime }) => {
    if (!anime || !anime.synopsis) return <p>Synopsis not available.</p>;

    const [readMore, setReadMore] = useState(false);

    const synopsisText = anime.synopsis;

    return (
        <div className="anime-synopsis">
            <p className="synopsis">
                {readMore ? synopsisText : synopsisText.slice(0, 200) + ' ...'}
                {synopsisText.length > 250 && (
                    <span onClick={() => setReadMore(!readMore)} className="read-more">
                        {readMore ? ' Show Less' : ' Read More'}
                    </span>
                )}
            </p>
        </div>
    )
}

export default AnimeSynopsis;