import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Definir a duração do login em milissegundos (7 dias)
    const LOGIN_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 dias

    // Carrega o estado inicial do localStorage
    const storedLoginTime = localStorage.getItem('loginTime');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserId = localStorage.getItem('userId');

    // Verifica se o login expirou
    const isLoginExpired = storedLoginTime && (Date.now() - storedLoginTime > LOGIN_EXPIRATION_TIME);
    
    // Se o login expirou, limpa o localStorage
    if (isLoginExpired) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginTime');
    }

    const [isLoggedIn, setIsLoggedIn] = useState(storedIsLoggedIn && !isLoginExpired);
    const [userId, setUserId] = useState(storedUserId && !isLoginExpired ? storedUserId : null);

    const login = (id) => {
        setIsLoggedIn(true);
        setUserId(id);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', id);
        localStorage.setItem('loginTime', Date.now());
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserId(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginTime');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);