import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from './ConfirmModal'; // Importe o novo componente
import '../styles/header.css';

const Header = () => {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(true); // Abre o modal ao clicar em "Sair"
    };

    const confirmLogout = () => {
        logout(); // Chama a função de logout real
        setShowLogoutModal(false); // Fecha o modal
    };

    const cancelLogout = () => {
        setShowLogoutModal(false); // Apenas fecha o modal
    };

    let links;
    if (isLoggedIn) {
        // Exibe o botão que abre o modal
        const logoutButton = <button onClick={handleLogout} className="logout-button">Sair</button>;

        if (path === "/profile") {
            links = (
                <>
                    <Link to="/" className="home">Home Page</Link>
                </>
            );
        } else {
            links = (
                <>
                    {logoutButton}
                    <Link to="/profile" className="profile">Access your Profile</Link>
                </>
            );
        }
    } else {
        if (path === "/signup" || path === "/login") {
            links = <Link to="/" className="home">Home Page</Link>;
        } else {
            links = (
                <>
                    <Link to="/signup" className="signup">Sign-up</Link>
                    <Link to="/login" className="login">Log-in</Link>
                </>
            );
        }
    }

    return (
        <nav className="header">
            <h1 className="header__title">AnimeSearch</h1>
            <div>
                {links}
            </div>
            {/* Renderiza o modal se o estado for true */}
            {showLogoutModal && (
                <ConfirmModal
                    message="Você tem certeza que deseja sair?"
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout}
                />
            )}
        </nav>
    );
};

export default Header;