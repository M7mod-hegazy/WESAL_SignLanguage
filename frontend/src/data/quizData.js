// Quiz data for SOLO MODE
// Videos: /videos/new/webm/ (Arabic-named WebM files)
// Solo videos: سجادة, طاولة, عقال
const soloQuizQuestions = [
  {
    "id": 1,
    "videoPath": "/videos/new/webm/سجادة_alpha.webm",
    "correctAnswer": "سجادة",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 2,
    "videoPath": "/videos/new/webm/طاولة_alpha.webm",
    "correctAnswer": "طاولة",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 3,
    "videoPath": "/videos/new/webm/عقال_alpha.webm",
    "correctAnswer": "عقال",
    "difficulty": "easy",
    "coins_reward": 10
  }
];

// Quiz data for TEAM MODE
// Videos: /videos/final2/webm_alpha/ (Team videos)
// Team videos: All except سجادة, طاولة, عقال
const teamQuizQuestions = [
  {
    "id": 1,
    "videoPath": "/videos/final2/webm_alpha/متضايق_alpha.webm",
    "correctAnswer": "متضايق",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 2,
    "videoPath": "/videos/final2/webm_alpha/حزين_alpha.webm",
    "correctAnswer": "حزين",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 3,
    "videoPath": "/videos/final2/webm_alpha/سعيد_alpha.webm",
    "correctAnswer": "سعيد",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 4,
    "videoPath": "/videos/final2/webm_alpha/غاضب_alpha.webm",
    "correctAnswer": "غاضب",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 5,
    "videoPath": "/videos/final2/webm_alpha/خائف_alpha.webm",
    "correctAnswer": "خائف",
    "difficulty": "easy",
    "coins_reward": 10
  }
];

// Keep regularQuizQuestions for backward compatibility (defaults to solo)
const regularQuizQuestions = soloQuizQuestions;

// Pool of wrong answers to randomly select from
const wrongAnswersPool = [
  "مرحباً، كيف يمكنني مساعدتك؟",
  "أتمنى لك يوماً سعيداً",
  "شكراً لك على وقتك",
  "هل تحتاج إلى مساعدة إضافية؟",
  "نحن سعداء بخدمتك",
  "أهلاً وسهلاً بك",
  "نتمنى لك تجربة ممتعة",
  "شكراً على تفهمك",
  "نقدر ثقتك بنا",
  "مساء الخير والسرور",
  "أريد كأساً من الماء",
  "أعتذر لارتباطي بعمل",
  "السلام عليكم",
  "صباح الخير",
  "كل عام وانت بخير",
  "مبروك المولود",
  "نجاح مبارك",
  "هل أنت بخير؟"
];

// Function to generate 3 random wrong answers (different from correct answer)
const generateWrongAnswers = (correctAnswer) => {
  const availableWrongs = wrongAnswersPool.filter(ans => ans !== correctAnswer);
  const shuffled = [...availableWrongs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

// Function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Simulation quiz data for COFFEE SCENARIO
// Videos: /videos/coffee/ with ordered filenames
const simulationQuizQuestions = [
  {
    "id": 1,
    "videoPath": "/videos/coffee/1_greeting.webm",
    "correctAnswer": "السلام عليكم",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 2,
    "videoPath": "/videos/coffee/2_order_coffee.webm",
    "correctAnswer": "أريد قهوة من فضلك",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 3,
    "videoPath": "/videos/coffee/3_okay.webm",
    "correctAnswer": "حسناً",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 4,
    "videoPath": "/videos/coffee/4_please_sit.webm",
    "correctAnswer": "من فضلك اجلس",
    "difficulty": "medium",
    "coins_reward": 15
  }
];

// Function to get a quiz question with shuffled answers
export const getQuizQuestion = (questionId, isSimulation = false, mode = 'solo') => {
  let questionsArray;
  
  if (isSimulation) {
    questionsArray = simulationQuizQuestions;
  } else if (mode === 'team') {
    questionsArray = teamQuizQuestions;
  } else {
    questionsArray = soloQuizQuestions;
  }
  
  const question = questionsArray.find(q => q.id === questionId);
  if (!question) return null;

  const wrongAnswers = generateWrongAnswers(question.correctAnswer);
  
  const answers = [
    { text: question.correctAnswer, is_correct: true },
    { text: wrongAnswers[0], is_correct: false },
    { text: wrongAnswers[1], is_correct: false },
    { text: wrongAnswers[2], is_correct: false }
  ];

  // Use the videoPath directly from the question (already has full path with extension)
  const videoPath = question.videoPath;

  return {
    id: question.id,
    videoPath: videoPath,
    correctAnswer: question.correctAnswer,
    difficulty: question.difficulty,
    coins_reward: question.coins_reward,
    answers: shuffleArray(answers) // Shuffle answer order
  };
};

// Function to get all questions in random order (SOLO or TEAM QUIZ)
export const getAllQuestionsRandomized = (mode = 'solo') => {
  const questionsArray = mode === 'team' ? teamQuizQuestions : soloQuizQuestions;
  
  const shuffledQuestions = shuffleArray(questionsArray);
  
  const mappedQuestions = shuffledQuestions.map(q => {
    const mapped = getQuizQuestion(q.id, false, mode);
    return mapped;
  });
  
  return mappedQuestions;
};

// Function to get all simulation questions in order (SIMULATION QUIZ)
export const getSimulationQuestions = () => {
  console.log('📊 getSimulationQuestions called');
  console.log('📊 simulationQuizQuestions count:', simulationQuizQuestions.length);
  
  const mappedQuestions = simulationQuizQuestions.map(q => {
    console.log('📊 Mapping simulation question:', q.id, q.correctAnswer);
    const mapped = getQuizQuestion(q.id, true);
    console.log('📊 Mapped result:', mapped);
    return mapped;
  });
  
  console.log('📊 Final simulation questions count:', mappedQuestions.length);
  return mappedQuestions;
};

// Function to get a random question
export const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * regularQuizQuestions.length);
  return getQuizQuestion(regularQuizQuestions[randomIndex].id, false);
};

// Function to get total number of questions
export const getTotalQuestions = () => {
  return regularQuizQuestions.length;
};

// Export all functions as named exports and default
const quizDataExport = {
  getQuizQuestion,
  getAllQuestionsRandomized,
  getSimulationQuestions,
  getRandomQuestion,
  getTotalQuestions
};

export default quizDataExport;
