const { Task, TaskMember, Board } = require('../models');


//basic CRUD
async function createTask(req, res) {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllTasks(req, res) {
    try {
        const tasks = await Task.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTaskById(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateTask(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        await task.update(req.body);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteTask(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        await task.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTaskMembersByTask(req, res) {
    try {
        const taskMembers = await TaskMember.findAll({ where: { taskId: req.params.id } });
        res.json(taskMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTasksByBoard(req, res) {
    try {
        const board = await Board.findByPk(req.params.id, { include: { model: Task, as: 'tasks' } });
        if (!board) return res.status(404).json({ message: 'Board not found' });
        res.json(board.tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskMembersByTask,
    getTasksByBoard
};
