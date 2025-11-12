const mongoose = require('mongoose');

const simulationSceneSchema = new mongoose.Schema({
  sceneNumber: {
    type: Number,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  hints: [String]
});

const simulationChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  scenario: {
    type: String,
    required: true // e.g., 'coffee_shop', 'restaurant', 'hospital'
  },
  difficulty: {
    type: String,
    enum: ['سهل', 'متوسط', 'صعب'],
    default: 'متوسط'
  },
  scenes: [simulationSceneSchema],
  totalScenes: {
    type: Number,
    required: true
  },
  coinsReward: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get challenge in response format
simulationChallengeSchema.methods.toResponseFormat = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    scenario: this.scenario,
    difficulty: this.difficulty,
    scenes: this.scenes.map(scene => ({
      sceneNumber: scene.sceneNumber,
      videoUrl: scene.videoUrl,
      correctAnswer: scene.correctAnswer,
      hints: scene.hints || []
    })),
    totalScenes: this.totalScenes,
    coinsReward: this.coinsReward
  };
};

module.exports = mongoose.model('SimulationChallenge', simulationChallengeSchema);
