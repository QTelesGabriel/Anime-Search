import React, { useState } from 'react';
import '../styles/animeSynopsis.css'

const AnimeSynopsis = ({ anime }) => {

    const [readMore, setReadMore] = useState(false);

    return (
        <div className="anime-synopsis">
            <p className="synopsis">
                {readMore ? anime.synopsis : anime.synopsis.slice(0, 200) + ' ...'}
                {anime.synopsis.length > 250 && (
                    <span onClick={() => setReadMore(!readMore)} className="read-more">
                        {readMore ? ' Show Less' : ' Read More'}
                    </span>
                )}
            </p>
        </div>
    )
}

export default AnimeSynopsis;