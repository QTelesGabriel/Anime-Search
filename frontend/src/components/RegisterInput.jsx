import React from 'react';
import '../styles/registerInput.css';

const RegisterInput = ({ title, placeholder, register, setRegister, type = 'text' }) => {
    return (
        <div className="register">
            <p className="register__title">{title}</p>
            <input
                type={type} // Agora o tipo é dinâmico
                placeholder={placeholder}
                className="register-bar__input"
                value={register}
                onChange={(e) => setRegister(e.target.value)}
            />
        </div>
    );
}

export default RegisterInput;