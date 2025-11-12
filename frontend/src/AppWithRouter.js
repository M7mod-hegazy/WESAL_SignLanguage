import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TutorialPage from './pages/TutorialPage';
import TutorialPage2 from './pages/TutorialPage2';
import TutorialPage3 from './pages/TutorialPage3';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing and Tutorial Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/tutorial2" element={<TutorialPage2 />} />
        <Route path="/tutorial3" element={<TutorialPage3 />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Main App Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        
        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
