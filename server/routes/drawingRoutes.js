const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawingController');

// POST /api/drawings - Create a new drawing
router.post('/', drawingController.createDrawing);

// GET /api/drawings/:userId - Get all drawings for a user
router.get('/:userId', drawingController.getDrawings);

module.exports = router;