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
import SoloModePage from './pages/SoloModePage';
import TeamPage from './pages/TeamPage';
import TeamPlayersPage from './pages/TeamPlayersPage';
import TeamSpinPage from './pages/TeamSpinPage';
import SimulationModePage from './pages/SimulationModePage';
import SimulationQuizPage from './pages/SimulationQuizPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

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
        <Route path="/solo" element={<SoloModePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team-players" element={<TeamPlayersPage />} />
        <Route path="/team-spin" element={<TeamSpinPage />} />
        <Route path="/simulation" element={<SimulationModePage />} />
        <Route path="/simulation-quiz" element={<SimulationQuizPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        
        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
