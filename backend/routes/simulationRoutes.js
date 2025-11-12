const express = require('express');
const router = express.Router();
const {
  getAllSimulations,
  getSimulationByScenario,
  checkAnswer
} = require('../controllers/simulationController');

// Public routes
router.get('/', getAllSimulations);
router.get('/:scenario', getSimulationByScenario);
router.post('/:id/check', checkAnswer);

module.exports = router;
