import React from 'react';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import Login from './pages/Login';
import Anime from './pages/Anime';
import Character from './pages/Character';
import VoiceActor from './pages/VoiceActor';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/anime/:id" element={<Anime />} />
          <Route path="/character/:id" element={<Character />} />
          <Route path="/voice-actor/:id" element={<VoiceActor />} /> {/* 👈 Adicione a nova rota */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;