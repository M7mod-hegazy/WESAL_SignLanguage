import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuizInterface from '../components/QuizInterface';
import { getAllQuestionsRandomized } from '../data/quizData';
import { incrementChallengesCount } from '../utils/challengeCounter';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, coins, addCoins, subtractCoins } = useAuth();
  const { timeLimit, firstPlayer, players, category, mode, type } = location.state || {};
  
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSequential, setIsSequential] = useState(false);
  
  // Log team mode data
  useEffect(() => {
    if (mode === 'team') {
      console.log('Team Mode Active');
      console.log('Time Limit per question:', timeLimit, 'seconds');
      console.log('First Player:', firstPlayer);
      console.log('All Players:', players);
      console.log('Category:', category);
    }
  }, [mode, timeLimit, firstPlayer, players, category]);
  
  const [quizBackHandler, setQuizBackHandler] = useState(null);

  const handleBack = () => {
    if (quizBackHandler) {
      quizBackHandler(); // Call QuizInterface's back handler (shows quit modal)
    } else {
      navigate(-1); // Fallback: Go back directly
    }
  };

  // Initialize quiz - either sequential or random
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Check if this is a simulation (sequential) quiz
        if (type === 'simulation' && category) {
          setIsSequential(true);
          const response = await fetch(`http://localhost:8000/api/signs/sequential_quiz/${encodeURIComponent(category)}`);
          const data = await response.json();
          
          if (data.success && data.questions) {
            setAllQuestions(data.questions);
            setCurrentQuiz(data.questions[0]);
          }
        } else {
          // Random quiz (existing behavior)
          const questions = getAllQuestionsRandomized();
          setAllQuestions(questions);
          setCurrentQuiz(questions[0]);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        // Fallback to local data
        const questions = getAllQuestionsRandomized();
        setAllQuestions(questions);
        setCurrentQuiz(questions[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [type, category]);

  const handleAnswer = async (isCorrect, answer, hintWasUsed) => {
    if (isCorrect && currentQuiz) {
      // Only add coins if hint was NOT used
      if (!hintWasUsed) {
        console.log('✅ Correct answer without hint! Adding 50 coins');
        addCoins(50);
      } else {
        console.log('⚠️ Hint was used, no coins awarded');
      }
      
      // Increment challenges counter ONLY in solo mode (not team mode)
      if (mode === 'solo' && user?.uid) {
        try {
          await incrementChallengesCount(user.uid);
          console.log('✅ Challenge incremented successfully');
        } catch (error) {
          console.error('Failed to increment challenge:', error);
        }
      }
    }
  };

  const handleUseHint = async () => {
    if (coins >= 100) {
      const success = await subtractCoins(100);
      return success; // Returns true if coins were deducted
    }
    return false; // Not enough coins
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % allQuestions.length;
    setCurrentQuestionIndex(nextIndex);
    setCurrentQuiz(allQuestions[nextIndex]);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px',
        color: '#F18A21',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #FFE8CC',
          borderTop: '5px solid #F18A21',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>جاري التحميل...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: '#FFF9F0',
        position: 'relative',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px'
      }}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 10,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src="/pages/back.png" 
            alt="Back"
            style={{
              width: '24px',
              height: '24px',
              display: 'block'
            }}
          />
        </button>
        <QuizInterface
          quizData={currentQuiz}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          coins={coins}
          onUseHint={handleUseHint}
          timeLimit={timeLimit || 30}
          teamMode={mode === 'team'}
          currentPlayer={firstPlayer}
          players={players}
          onBackClick={null}
        />
      </div>
    </div>
  );
};
export default QuizPage;
