import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import '../styles/header.css'

const Header = () => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    return (
        <nav className="header">
            <h1 className="header__title">AnimeSearch</h1>
            <div>
                {
                    !isLoggedIn && path !== "/signup" && path !== "/login" ? (
                        <>
                            <Link to="/signup" className="signup">Sign-up</Link>
                            <Link to="/login" className="login">Log-in</Link>
                        </>
                    ) : path === "/signup" ? (
                        <Link to="/" className="home">Home Page</Link>
                    ) : path === "/login" ? (
                        <Link to="/" className="home">Home Page</Link>
                    ) : path === "/profile" ? (
                        <Link to="/" className="home">Home Page</Link>
                    ) : (
                        <Link to="/profile" className="profile">Access your Profile</Link>
                    )
                }
            </div>
        </nav>
    )
}

export default Header;