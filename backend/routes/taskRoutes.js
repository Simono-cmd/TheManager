const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const authMiddleware = require("../middleware/authMiddleware");

// CRUD
router.post('/',authMiddleware, TaskController.createTask);
router.get('/',authMiddleware, TaskController.getAllTasks);
router.get('/:id',authMiddleware, TaskController.getTaskById);
router.put('/:id',authMiddleware, TaskController.updateTask);
router.delete('/:id',authMiddleware, TaskController.deleteTask);

// additional methods
router.get('/board/:boardId',authMiddleware, TaskController.getTasksByBoard);
router.get('/:id/members',authMiddleware, TaskController.getTaskMembersByTask);

module.exports = router;
