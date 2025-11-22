// Real quiz data based on actual video files
// Each video name is the correct answer

import { videoMapping } from './videoMapping';

const videoQuestions = [
  {
    "id": 1,
    "videoPath": "/videos/new/webm/أريد كأساً من الماء.webm",
    "correctAnswer": "أريد كأساً من الماء",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 2,
    "videoPath": "/videos/new/webm/أعتذر لارتباطي بعمل.webm",
    "correctAnswer": "أعتذر لارتباطي بعمل",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 3,
    "videoPath": "/videos/new/webm/السلام عليكم.webm",
    "correctAnswer": "السلام عليكم",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 4,
    "videoPath": "/videos/new/webm/صباح الخير.webm",
    "correctAnswer": "صباح الخير",
    "difficulty": "easy",
    "coins_reward": 10
  },
  {
    "id": 5,
    "videoPath": "/videos/new/webm/كل عام و انت بخير.webm",
    "correctAnswer": "كل عام وانت بخير",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 6,
    "videoPath": "/videos/new/webm/مبروك المولود.webm",
    "correctAnswer": "مبروك المولود",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 7,
    "videoPath": "/videos/new/webm/نجاح مبارك.webm",
    "correctAnswer": "نجاح مبارك",
    "difficulty": "medium",
    "coins_reward": 15
  },
  {
    "id": 8,
    "videoPath": "/videos/new/webm/هل أنت بخير ؟.webm",
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

// Function to get a quiz question with shuffled answers
export const getQuizQuestion = (questionId) => {
  const question = videoQuestions.find(q => q.id === questionId);
  if (!question) return null;

  const wrongAnswers = generateWrongAnswers(question.correctAnswer);
  
  const answers = [
    { text: question.correctAnswer, is_correct: true },
    { text: wrongAnswers[0], is_correct: false },
    { text: wrongAnswers[1], is_correct: false },
    { text: wrongAnswers[2], is_correct: false }
  ];

  // Get the English filename from mapping
  const originalName = question.correctAnswer;
  const englishFileName = videoMapping[originalName];
  
  if (!englishFileName) {
    console.error(`No mapping found for: ${originalName}`);
    return null;
  }
  
  // Create video path (base path without extension for VideoAnimation component)
  const videoPath = `/videos/optimized/${englishFileName}`;

  return {
    id: question.id,
    videoPath: videoPath,
    videoFileName: question.videoFileName,
    difficulty: question.difficulty,
    coins_reward: question.coins_reward,
    answers: shuffleArray(answers) // Shuffle answer order
  };
};

// Function to get all questions in random order
export const getAllQuestionsRandomized = () => {
  const shuffledQuestions = shuffleArray(videoQuestions);
  return shuffledQuestions.map(q => getQuizQuestion(q.id));
};

// Function to get a random question
export const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * videoQuestions.length);
  return getQuizQuestion(videoQuestions[randomIndex].id);
};

// Function to get total number of questions
export const getTotalQuestions = () => {
  return videoQuestions.length;
};

export default {
  getQuizQuestion,
  getAllQuestionsRandomized,
  getRandomQuestion,
  getTotalQuestions
};
