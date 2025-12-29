const express = require('express');
const router = express.Router();
const TaskMemberController = require('../controllers/taskMemberController');
const authMiddleware = require("../middleware/authMiddleware");

// CRUD
router.post('/', authMiddleware,TaskMemberController.createTaskMember);
router.get('/', authMiddleware,TaskMemberController.getAllTaskMembers);
router.get('/:id', authMiddleware,TaskMemberController.getTaskMemberById);
router.put('/:id', authMiddleware,TaskMemberController.updateTaskMember);
router.delete('/:id', authMiddleware,TaskMemberController.deleteTaskMember);

module.exports = router;
