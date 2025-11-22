import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuizInterface from '../components/QuizInterface';
import { incrementChallengesCount } from '../utils/challengeCounter';
import quizDataModule from '../data/quizData';

const SimulationQuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, coins, addCoins, subtractCoins } = useAuth();
  const { category } = location.state || { category: 'محاكاة المقهى' };
  
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load quiz data from local file (no API call needed)
  useEffect(() => {
    try {
      // Get all quiz questions from the imported module
      const quizQuestions = quizDataModule.default || quizDataModule;
      
      if (quizQuestions && quizQuestions.length > 0) {
        // Map quiz data to the format expected by QuizInterface
        const mappedQuestions = quizQuestions.map((q, index) => {
          // Generate multiple choice answers from the quiz data
          const answers = quizDataModule.generateAnswersForQuestion ? 
            quizDataModule.generateAnswersForQuestion(q) :
            [
              { text: q.correctAnswer, isCorrect: true },
              { text: 'إجابة خاطئة 1', isCorrect: false },
              { text: 'إجابة خاطئة 2', isCorrect: false },
              { text: 'إجابة خاطئة 3', isCorrect: false }
            ];
          
          return {
            id: q.id || index + 1,
            videoPath: q.videoPath,
            correctAnswer: q.correctAnswer,
            answers: answers,
            coins_reward: q.coins_reward || 10,
            difficulty: q.difficulty || 'medium',
            category: category,
            order: index
          };
        });
        
        setAllQuestions(mappedQuestions);
        setCurrentQuiz(mappedQuestions[0]);
        console.log('✅ Loaded', mappedQuestions.length, 'quiz questions for simulation');
      } else {
        console.error('❌ No questions found in quiz data');
        alert('لا توجد أسئلة متاحة');
        navigate(-1);
      }
    } catch (error) {
      console.error('❌ Error loading simulation quiz:', error);
      alert('فشل تحميل التحدي، حاول مرة أخرى');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [category, navigate]);

  const handleAnswer = useCallback(async (isCorrect, answer, hintWasUsed) => {
    console.log('🎯 handleAnswer called:', { isCorrect, currentQuiz: !!currentQuiz, hintWasUsed });
    if (isCorrect && currentQuiz) {
      // Only add coins if hint was NOT used
      if (!hintWasUsed) {
        console.log('✅ Correct answer without hint! Adding 50 coins');
        addCoins(50);
      } else {
        console.log('⚠️ Hint was used, no coins awarded');
      }
      
      // Increment challenges counter (simulation is always solo mode)
      if (user?.uid) {
        try {
          await incrementChallengesCount(user.uid);
          console.log('✅ Challenge incremented successfully');
        } catch (error) {
          console.error('Failed to increment challenge:', error);
        }
      }
    }
  }, [user, addCoins, currentQuiz]);

  const handleUseHint = useCallback(async () => {
    if (coins >= 100) {
      const success = await subtractCoins(100);
      return success; // Returns true if coins were deducted
    }
    return false; // Not enough coins
  }, [coins, subtractCoins]);

  const handleNextQuestion = useCallback(() => {
    // Sequential - go to next question
    if (currentQuestionIndex < allQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuiz(allQuestions[nextIndex]);
    } else {
      // Finished all questions
      alert('🎉 أحسنت! أكملت تحدي المحاكاة');
      navigate(-1);
    }
  }, [currentQuestionIndex, allQuestions, navigate]);

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
        <div>جاري تحميل التحدي...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#005593',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>لا توجد أسئلة متاحة</div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Questions loaded: {allQuestions.length}
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 30px',
            background: '#F18A21',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          رجوع
        </button>
      </div>
    );
  }

  // Check if this is coffee simulation to show background
  const isCoffeeSimulation = category === 'محاكاة المقهى';

  return (
    <div style={{
      minHeight: '100vh',
     
      backgroundAttachment: isCoffeeSimulation ? 'fixed' : 'scroll',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: isCoffeeSimulation ? 'rgba(255, 249, 240, 0.85)' : '#FFF9F0',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        backdropFilter: isCoffeeSimulation ? 'blur(3px)' : 'none'
      }}>
        <QuizInterface
          quizData={currentQuiz}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          coins={coins}
          onUseHint={handleUseHint}
          timeLimit={30}
          onBackClick={null}
        />
      </div>
    </div>
  );
};

export default SimulationQuizPage;
