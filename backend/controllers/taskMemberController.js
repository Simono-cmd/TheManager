const { TaskMember, Task, User, Board } = require('../models');

async function addMember(req, res) {
    try {
        const { taskId, userId, role } = req.body;

        const task = await Task.findByPk(taskId, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role !== 'admin' && task.board.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingMember = await TaskMember.findOne({ where: { taskId, userId } });
        if (existingMember) {
            return res.status(409).json({ message: "User is already assigned to this task" });
        }

        const member = await TaskMember.create({
            taskId,
            userId,
            role: role || 'member'
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getMembersByTaskId(req, res) {
    try {
        const { taskId } = req.params;

        const task = await Task.findByPk(taskId, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role !== 'admin' && task.board.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const members = await TaskMember.findAll({
            where: { taskId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }]
        });
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateMemberRole(req, res) {
    try {
        const { taskId, userId } = req.params;
        const { role } = req.body;

        const task = await Task.findByPk(taskId, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (req.user.role !== 'admin' && task.board.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const member = await TaskMember.findOne({ where: { taskId, userId } });

        if (!member) {
            return res.status(404).json({ message: "Member not found in this task" });
        }

        member.role = role;
        await member.save();

        res.status(200).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function removeMember(req, res) {
    try {
        const { taskId, userId } = req.params;

        const task = await Task.findByPk(taskId, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (req.user.role !== 'admin' && task.board.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const deleted = await TaskMember.destroy({
            where: { taskId, userId }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Member not found" });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAllTaskMembers(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const members = await TaskMember.findAll({
            include: [
                { model: User, as: 'user', attributes: ['username'] },
                { model: Task, as: 'task', attributes: ['title'] }
            ]
        });

        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    addMember,
    getMembersByTaskId,
    updateMemberRole,
    removeMember,
    getAllTaskMembers
};