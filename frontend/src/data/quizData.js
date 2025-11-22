// Quiz data for REGULAR QUIZ
// Videos: /videos/new/webm/ (Arabic-named WebM files)
// Each video filename is the correct answer

const regularQuizQuestions = [
  {
    "id": 1,
    "videoPath": "/videos/new/webm/أريد كأساً من ا.webm",
    "correctAnswer": "أريد كأساً من الماء",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 2,
    "videoPath": "/videos/new/webm/أعتذر لارتباطي .webm",
    "correctAnswer": "أعتذر لارتباطي بعمل",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 3,
    "videoPath": "/videos/new/webm/السلام ع.webm",
    "correctAnswer": "السلام عليكم",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 4,
    "videoPath": "/videos/new/webm/صباح ا.webm",
    "correctAnswer": "صباح الخير",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 5,
    "videoPath": "/videos/new/webm/كل عام و انت .webm",
    "correctAnswer": "كل عام وانت بخير",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 6,
    "videoPath": "/videos/new/webm/مبروك الم.webm",
    "correctAnswer": "مبروك المولود",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 7,
    "videoPath": "/videos/new/webm/نجاح م.webm",
    "correctAnswer": "نجاح مبارك",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 8,
    "videoPath": "/videos/new/webm/هل أنت بخ.webm",
    "correctAnswer": "هل أنت بخير؟",
    "difficulty": "easy",
    "coins_reward": 10
  }
];

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
export const getQuizQuestion = (questionId, isSimulation = false) => {
  const questionsArray = isSimulation ? simulationQuizQuestions : regularQuizQuestions;
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

// Function to get all questions in random order (REGULAR QUIZ)
export const getAllQuestionsRandomized = () => {
  console.log('📊 getAllQuestionsRandomized called');
  console.log('📊 regularQuizQuestions count:', regularQuizQuestions.length);
  console.log('📊 regularQuizQuestions:', regularQuizQuestions);
  
  const shuffledQuestions = shuffleArray(regularQuizQuestions);
  console.log('📊 shuffledQuestions:', shuffledQuestions);
  
  const mappedQuestions = shuffledQuestions.map(q => {
    console.log('📊 Mapping question:', q.id, q.correctAnswer);
    const mapped = getQuizQuestion(q.id, false);
    console.log('📊 Mapped result:', mapped);
    return mapped;
  });
  
  console.log('📊 Final mappedQuestions count:', mappedQuestions.length);
  console.log('📊 Final mappedQuestions:', mappedQuestions);
  
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
