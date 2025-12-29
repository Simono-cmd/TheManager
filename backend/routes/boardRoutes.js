const express = require('express');
const router = express.Router();
const BoardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

// basic CRUD
router.post('/', authMiddleware, BoardController.createBoard);
router.get('/', authMiddleware,BoardController.getAllBoards);
router.get('/:id', authMiddleware,BoardController.getBoardById);
router.put('/:id', authMiddleware,BoardController.updateBoard);
router.delete('/:id', authMiddleware,BoardController.deleteBoard);

module.exports = router;
