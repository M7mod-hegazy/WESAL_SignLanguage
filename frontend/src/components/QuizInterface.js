import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoAnimation from './VideoAnimation';
import Timer from './Timer';
import AnswerButton from './AnswerButton';
import theme from '../theme/designSystem';

const QuizInterface = ({ quizData, onAnswer, onNextQuestion, coins, timeLimit = 30, onBackClick, onUseHint, teamMode = false, players = [], isSequential = false }) => {
  const navigate = useNavigate();
  console.log('🎯 [QuizInterface] Props received:', { isSequential, teamMode, quizData: quizData ? 'exists' : 'UNDEFINED' });
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerReset, setTimerReset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'correct', 'wrong', 'timeout'
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // All hooks MUST be called before any conditional returns
  useEffect(() => {
    // Reset state when new question loads
    if (quizData) {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setTimerReset(prev => prev + 1);
      setIsPaused(false);
      setHintUsed(false); // Reset hint for new question
    }
  }, [quizData]);

  // Pause video and timer when any modal is open
  useEffect(() => {
    if (showModal || showQuitModal) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [showModal, showQuitModal]);

  // Expose handleBackClick to parent via onBackClick prop
  useEffect(() => {
    if (onBackClick) {
      const handleBackClick = () => {
        setShowQuitModal(true);
        setIsPaused(true);
      };
      onBackClick(handleBackClick);
    }
  }, [onBackClick]);

  // Early return if no quiz data (AFTER all hooks)
  if (!quizData) {
    console.error('❌ [QuizInterface] quizData is undefined!');
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#F18A21',
        fontSize: '16px'
      }}>
        ⏳ جاري تحميل السؤال...
      </div>
    );
  }

  // Convert to Arabic-Indic numerals
  const toArabicNumerals = (num) => {
    if (!num && num !== 0) {
      console.warn('⚠️ [toArabicNumerals] num is undefined or null:', num);
      return '';
    }
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)] || digit).join('');
  };

  const handleHintClick = async () => {
    // Check if user has enough coins FIRST
    if (coins < 100) {
      alert(`❌ رصيدك غير كافٍ! لديك ${coins} عملة وتحتاج إلى 100 عملة`);
      return;
    }

    if (hintUsed) {
      alert('⚠️ لقد استخدمت التلميح بالفعل لهذا السؤال!');
      return;
    }
    
    if (showFeedback) {
      alert('⚠️ لقد أجبت على السؤال بالفعل!');
      return;
    }

    if (onUseHint) {
      const success = await onUseHint();
      if (success) {
        // Hint purchased successfully
        setHintUsed(true);
        alert('✅ تم استخدام التلميح! الإجابة الصحيحة مميزة باللون الأخضر');
      } else {
        alert('❌ رصيدك غير كافٍ! تحتاج إلى 100 عملة');
      }
    }
  };

  const handleAnswerClick = (answer, index) => {
    if (showFeedback) return;

    setSelectedAnswer(index);
    const correct = answer.isCorrect || answer.is_correct; // Support both formats
    setIsCorrect(correct);
    setShowFeedback(true);

    // Pass whether hint was used so parent can decide whether to award coins
    onAnswer(correct, answer.text, hintUsed);

    // Show appropriate modal
    if (correct) {
      setModalType('correct');
    } else {
      setModalType('wrong');
    }
    setShowModal(true);
  };

  const handleTimeUp = () => {
    if (!showFeedback) {
      setShowFeedback(true);
      setIsCorrect(false);
      
      // Team mode: Navigate back to team spin/roller page after timer ends
      if (teamMode) {
        setTimeout(() => {
          navigate('/team-spin', { 
            state: { 
              players: players,
              timeLimit: timeLimit
            } 
          });
        }, 500);
        return;
      }
      
      // Solo mode: Show timeout modal
      onAnswer(false, null);
      setModalType('timeout');
      setShowModal(true);
    }
  };

  const handleNextQuestion = () => {
    setShowModal(false);
    setShowFeedback(false);
    onNextQuestion();
  };

  const handleQuitQuiz = () => {
    navigate(-1); // Go back to previous page
  };

  const handleConfirmQuit = () => {
    navigate(-1);
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
    setIsPaused(false);
  };

  const handleBackClick = () => {
    setShowQuitModal(true);
    setIsPaused(true);
  };

  // Render quiz content (quizData is guaranteed to exist here)
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      background: '#F5F5F0',
      direction: 'rtl',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Back Button - Top Left */}
      <button
        onClick={handleBackClick}
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

      {/* Coins and Hint Display - Top Right */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        {/* Coin Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          direction: 'ltr'
        }}>
             <img 
            src="/coin.png" 
            alt="Coins" 
            style={{
              width: '35px',
              height: '35px',
              display: 'block'
            }}
          />
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {toArabicNumerals(coins)}
          </span>
       
        </div>

        {/* Hint Button */}
        <img 
          src="/hint.png" 
          alt="Hint" 
          style={{
            width: '40px',
            height: '40px',
            cursor: hintUsed || showFeedback ? 'not-allowed' : 'pointer',
            opacity: hintUsed || showFeedback ? 0.5 : 1,
            display: 'block',
            transition: 'opacity 0.3s ease'
          }}
          onClick={handleHintClick}
        />
      </div>

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        marginTop: '80px',
        padding: '0 20px'
      }}>
        {/* Character Card with Animation */}
        <div style={{
          background: isSequential ? '#efd1a7' : '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px',
          border: '3px solid #E8A87C',
          position: 'relative'
        }}>
          {/* Video Animation */}
          <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isSequential ? '#EDD0A5' : '#FFFFFF',
            overflow: 'hidden',
            borderRadius: '15px'
          }}>
            <VideoAnimation 
              videoSrc={quizData?.videoPath}
              isPlaying={!showFeedback && !isPaused}
              loop={true}
              isSimulation={isSequential}
              style={{
                background: 'transparent'
              }}
            />
          </div>

          {/* Timer in Control Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 15px',
            background: '#F5E6D3',
            borderRadius: '15px',
            marginBottom: '0'
          }}>
            <Timer 
              duration={timeLimit} 
              onTimeUp={handleTimeUp}
              isActive={!showFeedback && !isPaused}
              onReset={timerReset}
              inControlBar={true}
            />
          </div>
        </div>

        {/* Question Prompt with Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
          direction: 'ltr'
        }}>
          {/* Question Mark Icon - Only in Solo Mode */}
          {!teamMode && (
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#F18A21',
              lineHeight: 1
            }}>
              ؟
            </div>
          )}
          
          {/* Question Box */}
          {!teamMode && (
            <div style={{
              flex: 1,
              background: '#FFE8CC',
              border: '5px solid #F18A21',
              borderRadius: '12px',
              padding: '10px 15px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '16px',
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.primary,
                margin: 0
              }}>
                ما هي الإشارة الصحيحة؟
              </p>
            </div>
          )}
        </div>

        {/* Feedback Message - Only in Solo Mode */}
        {showFeedback && !teamMode && (
          <div style={{
            textAlign: 'center',
            padding: '15px 30px',
            borderRadius: '15px',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '15px',
            background: isCorrect 
              ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #FF4444 0%, #FF6666 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {isCorrect ? '🎉 صحيح! +' + quizData.coins_reward + ' نقاط' : '❌ خطأ! حاول مرة أخرى'}
          </div>
        )}

        {/* Question/Answer Section */}
        {teamMode ? (
          /* Team Mode: Show only correct answer in question area */
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #F18A21',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '28px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.primary,
              margin: 0
            }}>
              {quizData.answers && quizData.answers.find(a => a.isCorrect || a.is_correct)?.text}
            </p>
          </div>
        ) : (
          /* Solo Mode: Show question text */
          quizData.question && (
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #F18A21',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.primary,
                margin: 0
              }}>
                {quizData.question}
              </p>
            </div>
          )
        )}

        {/* Answer Options - Solo Mode Only */}
        {!teamMode && (
          /* Solo Mode: Show answer options grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {quizData.answers && quizData.answers.map((answer, index) => {
              const isCorrectAnswer = answer.isCorrect || answer.is_correct;
              const showAsCorrect = showFeedback && isCorrectAnswer;
              const showHintHighlight = hintUsed && !showFeedback && isCorrectAnswer;
              
              return (
                <AnswerButton
                  key={index}
                  text={answer.text}
                  onClick={() => handleAnswerClick(answer, index)}
                  disabled={showFeedback}
                  isCorrect={showAsCorrect}
                  isWrong={showFeedback && selectedAnswer === index && !isCorrectAnswer}
                  isSelected={selectedAnswer === index}
                  isHintHighlight={showHintHighlight}
                />
              );
            })}
          </div>
        )}

        {/* Hint Button - Removed as per design */}
      </div>

      {/* Result Modals */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#FFF9F0',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '350px',
            direction: 'rtl',
            fontFamily: theme.typography.fonts.primary,
            border: '3px solid #F18A21',
            position: 'relative',
            textAlign: 'center'
          }}>
            {/* Close Button */}
            <button
              onClick={handleQuitQuiz}
              style={{
                position: 'absolute',
                top: '-20px',
                right:'-20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              <img 
                src="/pages/quiz/quit.png" 
                alt="Close"
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'block'
                }}
              />
            </button>

            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: theme.typography.weights.bold,
              color: modalType === 'correct' ? theme.colors.primary.blue : theme.colors.primary.orange,
              fontFamily: theme.typography.fonts.primary,
              marginBottom: '20px',
              marginTop: '10px'
            }}>
              {modalType === 'correct' && 'إجابة صحيحة!'}
              {modalType === 'wrong' && 'محاولة جيدة!'}
              {modalType === 'timeout' && 'انتهى الوقت!'}
            </h2>

            {/* Face Image */}
            <div style={{
              marginBottom: '25px'
            }}>
              <img 
                src={modalType === 'correct' ? '/pages/quiz/happy.png' : '/pages/quiz/sad.png'}
                alt={modalType === 'correct' ? 'Happy' : 'Sad'}
                style={{
                  width: '120px',
                  height: '120px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              {/* Next Question Button */}
              <button
                onClick={handleNextQuestion}
                style={{
                  background: theme.colors.primary.blue,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 25px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: theme.typography.weights.bold,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>السؤال التالي</span>
              </button>

              {/* End Round Button */}
              <button
                onClick={handleQuitQuiz}
                style={{
                  background: theme.colors.primary.orange,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 25px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: theme.typography.weights.bold,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>إنهاء الجولة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#FFF9F0',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '350px',
            direction: 'rtl',
            fontFamily: theme.typography.fonts.primary,
            border: '3px solid #F18A21',
            position: 'relative',
            textAlign: 'center'
          }}>
            {/* Close Button */}
            <button
              onClick={handleCancelQuit}
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              <img 
                src="/pages/quiz/quit.png" 
                alt="Close"
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'block'
                }}
              />
            </button>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '20px'
            }}>
              {/* End Round Button */}
              <button
                onClick={handleConfirmQuit}
                style={{
                  background: theme.colors.secondary.yellow,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 25px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '18px',
                  fontWeight: theme.typography.weights.bold,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>إنهاء الجولة</span>
              </button>

              {/* Continue Playing Button */}
              <button
                onClick={handleCancelQuit}
                style={{
                  background: theme.colors.primary.orange,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 25px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '18px',
                  fontWeight: theme.typography.weights.bold,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>أكمل اللعب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add fadeIn animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuizInterface;
