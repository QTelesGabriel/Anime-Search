import React, { useState } from 'react';
import RegisterInput from '../components/RegisterInput';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/signup.css';

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pwAgain, setPwAgain] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            // Limpa mensagens anteriores
            setError("");
            setSuccess("");

            // 1. Validação inicial de senhas
            if (password !== pwAgain) {
                setError("As senhas não coincidem.");
                return;
            }

            // 2. Faz a requisição para a API de registro
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Registro bem-sucedido
                setSuccess(data.message + " Agora você pode fazer login.");
                setUsername("");
                setPassword("");
                setPwAgain("");
                
                // Redireciona para a página de login após o sucesso
                navigate('/login'); 
            } else {
                // Registro falhou (ex: usuário já existe)
                setError(data.detail || "Erro desconhecido ao registrar.");
            }

        } catch (err) {
            // Erro de rede ou servidor
            setError("Não foi possível conectar ao servidor. Tente novamente.");
            console.error("Erro de rede:", err);
        }
    };

    return (
        <>
            <Header />
            <div className="signup-page">
                <div className="signup-container">
                    <h1 className="signup__title">Sign-up</h1>
                    <div className="signup__space">
                        <div className="fill-spaces">
                            <RegisterInput 
                                title="Username:" 
                                placeholder="Create a username"
                                register={username}
                                setRegister={setUsername}
                            />
                            <RegisterInput 
                                title="Password:" 
                                placeholder="Create a password"
                                register={password}
                                setRegister={setPassword}
                                type="password"
                            />
                            <RegisterInput 
                                title="Repeat Password:" 
                                placeholder="Repeat your password"
                                register={pwAgain}
                                setRegister={setPwAgain}
                                type="password"
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <button 
                            onClick={handleSignup}
                            className="signup-button"
                        >
                            Sign-Up
                        </button>
                        <Link to="/login" className="link-login">I already have an account</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;