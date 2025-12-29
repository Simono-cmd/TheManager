const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require("../middleware/authMiddleware");

// basic CRUD
router.post('/',authMiddleware, userController.createUser);
router.get('/',authMiddleware, userController.getAllUsers);
router.get('/:id',authMiddleware, userController.getUserById);
router.put('/:id',authMiddleware, userController.updateUser);
router.delete('/:id',authMiddleware, userController.deleteUser);

// additional methods
router.get('/:id/boards',authMiddleware, userController.getBoardsByUser);
router.get('/:id/tasks',authMiddleware, userController.getTasksByUser);
router.get('/:id/task-members',authMiddleware, userController.getTaskMembersByUser);

module.exports = router;
