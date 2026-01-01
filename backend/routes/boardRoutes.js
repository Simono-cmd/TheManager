const express = require('express');
const router = express.Router();
const BoardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, BoardController.createBoard);
router.post('/admin-create', authMiddleware, BoardController.createBoardAdmin);
router.get('/', authMiddleware,BoardController.getAllBoards);
router.get('/admin-all', authMiddleware, BoardController.getAllBoardsAdmin);

router.get('/:id', authMiddleware,BoardController.getBoardById);
router.put('/:id', authMiddleware,BoardController.updateBoard);
router.delete('/:id', authMiddleware,BoardController.deleteBoard);

module.exports = router;
