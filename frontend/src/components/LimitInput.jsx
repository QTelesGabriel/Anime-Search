import React from 'react';
import '../styles/limitInput.css';

const LimitInput = ({ value, onChange, label, className = '' }) => {

    const handleChange = (e) => {
        let newValue = e.target.value;

        if (newValue.length > 1 && newValue.startsWith('0')) {
            newValue = parseInt(newValue).toString();
        }

        if (newValue === "") {
            onChange(0);
        } else {
            const num = parseInt(newValue);
            if (!isNaN(num) && num >= 0) {
                onChange(num);
            }
        }
    };

    return (
        <div className={`limit-input-container ${className}`}>
            <label className="limit-label">{label}</label>
            <div className="limit-input-with-arrows">
                <input
                    type="number"
                    min="0"
                    max="1000"
                    value={value}
                    onChange={handleChange}
                    className="limit-input"
                />
                <div className="limit-buttons">
                    <button
                        type="button"
                        className="limit-arrow limit-arrow-up"
                        onClick={() => onChange(value + 1)}
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        className="limit-arrow limit-arrow-down"
                        onClick={() => onChange(value - 1)}
                    >
                        ▼
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitInput;

