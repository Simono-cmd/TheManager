const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
import {authMiddleware} from "../middleware/authMiddleware";


router.post('/', authMiddleware, TaskController.createTask);
router.get('/', authMiddleware, TaskController.getAllTasks);

router.get('/board/:boardId', authMiddleware, TaskController.getTasksByBoard);

router.get('/:id', authMiddleware, TaskController.getTaskById);
router.put('/:id', authMiddleware, TaskController.updateTask);
router.delete('/:id', authMiddleware, TaskController.deleteTask);

module.exports = router;