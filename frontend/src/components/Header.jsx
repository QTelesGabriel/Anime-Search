import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Mascote from '../assets/Mascote.png';
import '../styles/header.css';

const Header = () => {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    let links;
    if (isLoggedIn) {
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
            {/* O h1 foi substituído por um div para ter mais controle sobre o layout do ícone e do texto */}
            <div className="header-brand">
                <img src={Mascote} alt="Mascote do site" className="header-icon" />
                <h1 className="header__title">AnimeSearch</h1>
            </div>
            <div>
                {links}
            </div>
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