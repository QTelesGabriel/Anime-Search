import React from 'react';
import '../styles/limitInput.css';

const LimitInput = ({ value, onChange, label, className = '' }) => {

    const handleChange = (e) => {
        let newValue = e.target.value;

        // Trata strings vazias e remove zeros à esquerda
        if (newValue.length > 1 && newValue.startsWith('0')) {
            newValue = parseInt(newValue, 10).toString();
        }

        if (newValue === "") {
            onChange(1); // Define como 1 se o campo for apagado
        } else {
            const num = parseInt(newValue, 10);
            if (!isNaN(num) && num >= 1) { // Garante que o número é válido e >= 1
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
                    min="1"
                    max="1000"
                    value={value}
                    onChange={handleChange}
                    className="limit-input"
                />
                <div className="limit-buttons">
                    <button
                        type="button"
                        className="limit-arrow limit-arrow-up"
                        onClick={() => {
                            if (value < 1000) { // Opcional: limite máximo
                                onChange(value + 1);
                            }
                        }}
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        className="limit-arrow limit-arrow-down"
                        onClick={() => {
                            if (value > 1) { // Impede que o valor seja menor que 1
                                onChange(value - 1);
                            }
                        }}
                    >
                        ▼
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitInput;