import React, { useState } from 'react';
import RegisterInput from '../components/RegisterInput';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/signup.css';

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pwAgain, setPwAgain] = useState("");

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
                                />
                            <RegisterInput 
                                title="Repeat Password:" 
                                placeholder="Repeat your password"
                                register={pwAgain}
                                setRegister={setPwAgain}
                                />
                        </div>
                        <button onClick={() => {
                            console.log(`Username: ${username}\nPassword: ${password}\nPasswordAgain: ${pwAgain}\n`)
                        }}
                        className="signup-button"
                        >Sign-Up</button>
                        <Link to="/login" className="link-login">I already have an account</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;