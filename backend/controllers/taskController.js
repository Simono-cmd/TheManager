const { Task, TaskMember, Board } = require('../models');

async function createTask(req, res) {
    try {
        const userId = req.user.id;
        const { title, description, deadline, boardId, status } = req.body;

        if (!boardId) {
            return res.status(400).json({ message: "Musisz podać ID tablicy (boardId)." });
        }

        const boardExists = await Board.findByPk(boardId);
        if (!boardExists) {
            return res.status(404).json({ message: `Tablica o ID ${boardId} nie istnieje.` });
        }

        const task = await Task.create({
            title,
            description,
            deadline,
            boardId,
            status: status || 'to do'
        });

        await TaskMember.create({
            taskId: task.id,
            userId: userId,
            role: 'owner'
        });

        res.status(201).json(task);

    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: "Podane ID tablicy jest nieprawidłowe." });
        }
        res.status(400).json({ message: error.message });
    }
}

async function getAllTasks(req, res) {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Task.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Board,
                as: 'board',
                attributes: ['id', 'name']
            }]
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            tasks: rows
        });

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

        if (req.body.boardId) {
            const boardExists = await Board.findByPk(req.body.boardId);
            if (!boardExists) {
                return res.status(404).json({ message: `Tablica docelowa o ID ${req.body.boardId} nie istnieje.` });
            }
        }

        await task.update(req.body);
        res.status(200).json(task);
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: "Podane ID tablicy jest nieprawidłowe." });
        }
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

async function getTasksByBoard(req, res) {
    try {
        const { boardId } = req.params;
        // Tutaj zazwyczaj NIE chcemy paginacji (kanban potrzebuje wszystkich),
        // więc zostawiamy findAll
        const tasks = await Task.findAll({
            where: { boardId: boardId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(tasks);
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
    getTasksByBoard
};