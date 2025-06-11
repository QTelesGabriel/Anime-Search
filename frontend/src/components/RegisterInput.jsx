import React from 'react'
import '../styles/registerInput.css'

const RegisterInput = ({ title, placeholder, register, setRegister }) => {
    return (
        <div className="register">
            <p className="register__title">{title}</p>
            <input
                type='text'
                placeholder={placeholder}
                className="register-bar__input"
                value={register}
                onChange={(e) => setRegister(e.target.value)}
            />
        </div>
    )
}

export default RegisterInput;