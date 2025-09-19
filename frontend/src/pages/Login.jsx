import React, { useState } from 'react';
import RegisterInput from '../components/RegisterInput';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Header from '../components/Header';
import '../styles/login.css';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setError("");
            setSuccess("");

            const response = await fetch('http://localhost:8000/login', {
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
                setSuccess(data.message);
                
                const userId = data.user_id;

                if (userId) { // <-- Verificação de segurança adicionada
                    console.log("ID do usuário obtido:", userId);
                    login(userId);
                    navigate('/profile');
                } else {
                    // Se a resposta OK não contiver o userId, mostre um erro
                    console.error("Login bem-sucedido, mas o ID do usuário está faltando.");
                }

            } else {
                setError(data.detail || "Erro desconhecido ao fazer login.");
                console.error("Erro no login:", data.detail);
            }

        } catch (err) {
            setError("Não foi possível conectar ao servidor. Tente novamente.");
            console.error("Erro de rede:", err);
        }
    };

    return (
        <>
            <Header />
            <div className="login-page">
                <div className="login-container">
                    <h1 className="login__title">Log-in</h1>
                    <div className="login__space">
                        <div className="fill-spaces">
                            <RegisterInput 
                                title="Username:" 
                                placeholder="Enter your username"
                                register={username}
                                setRegister={setUsername}
                            />
                            <RegisterInput 
                                title="Password:" 
                                placeholder="Enter your password"
                                register={password}
                                setRegister={setPassword}
                                type="password"
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <button 
                            onClick={handleLogin}
                            className="login-button"
                        >
                            Log-in
                        </button>
                        <Link to="/signup" className="link-signup">I don't have an account</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;