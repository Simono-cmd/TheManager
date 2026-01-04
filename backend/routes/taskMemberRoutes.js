const express = require('express');
const router = express.Router();
const taskMemberController = require('../controllers/taskMemberController');
const {authMiddleware} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get('/', taskMemberController.getAllTaskMembers);
router.post('/', taskMemberController.addMember);
router.get('/:taskId', taskMemberController.getMembersByTaskId);
router.put('/:taskId/:userId', taskMemberController.updateMemberRole);
router.delete('/:taskId/:userId', taskMemberController.removeMember);

module.exports = router;