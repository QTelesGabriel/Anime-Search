import React, { useState } from 'react';
import RegisterInput from '../components/RegisterInput';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/login.css';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <>
            <Header />
            <div className="login-page">
                <div className="login-container">
                    <h1 className="login__title">Sign-up</h1>
                    <div className="login__space">
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
                                />
                        </div>
                        <button onClick={() => {
                            console.log(`Username: ${username}\nPassword: ${password}\nPasswordAgain: ${pwAgain}\n`)
                        }}
                        className="login-button"
                        >Log-in</button>
                        <Link to="/signup" className="link-signup">I don't have an account</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;