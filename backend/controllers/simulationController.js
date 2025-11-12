const SimulationChallenge = require('../models/SimulationChallenge');

// @desc    Get all simulation challenges
// @route   GET /api/simulations
// @access  Public
exports.getAllSimulations = async (req, res) => {
  try {
    const simulations = await SimulationChallenge.find({ isActive: true });
    
    res.json({
      success: true,
      simulations: simulations.map(sim => sim.toResponseFormat())
    });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch simulations'
    });
  }
};

// @desc    Get simulation by scenario
// @route   GET /api/simulations/:scenario
// @access  Public
exports.getSimulationByScenario = async (req, res) => {
  try {
    const simulation = await SimulationChallenge.findOne({ 
      scenario: req.params.scenario,
      isActive: true 
    });

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: 'Simulation not found'
      });
    }

    res.json({
      success: true,
      simulation: simulation.toResponseFormat()
    });
  } catch (error) {
    console.error('Get simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch simulation'
    });
  }
};

// @desc    Check answer for a scene
// @route   POST /api/simulations/:id/check
// @access  Public
exports.checkAnswer = async (req, res) => {
  try {
    const { sceneNumber, answer } = req.body;
    const simulation = await SimulationChallenge.findById(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: 'Simulation not found'
      });
    }

    const scene = simulation.scenes.find(s => s.sceneNumber === sceneNumber);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        error: 'Scene not found'
      });
    }

    const isCorrect = answer.trim() === scene.correctAnswer.trim();

    res.json({
      success: true,
      isCorrect,
      correctAnswer: scene.correctAnswer,
      coinsEarned: isCorrect ? Math.floor(simulation.coinsReward / simulation.totalScenes) : 0
    });
  } catch (error) {
    console.error('Check answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check answer'
    });
  }
};
