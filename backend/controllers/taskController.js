const { Task, TaskMember, Board } = require('../models');

async function createTask(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { title, description, deadline, boardId, status } = req.body;


        if (!boardId) {
            return res.status(400).json({ message: "BoardID is required" });
        }

        if(!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ message: `Board with ID ${boardId} does not exist` });
        }

        if (userRole !== 'admin' && board.ownerId !== userId) {
            return res.status(403).json({ message: "You can only add tasks to your own boards" });
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
        res.status(400).json({ message: error.message });
    }
}

//for admin panel
async function getAllTasks(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

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
                attributes: ['id', 'name', 'ownerId']
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
        const userId = req.user.id;
        const userRole = req.user.role;

        const task = await Task.findByPk(req.params.id, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (userRole !== 'admin' && task.board.ownerId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateTask(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const task = await Task.findByPk(req.params.id, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (userRole !== 'admin' && task.board.ownerId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (req.body.boardId && req.body.boardId !== task.boardId) {
            const targetBoard = await Board.findByPk(req.body.boardId);

            if (!targetBoard) {
                return res.status(404).json({ message: `Target Board with ID ${req.body.boardId} does not exist` });
            }

            if (userRole !== 'admin' && targetBoard.ownerId !== userId) {
                return res.status(403).json({ message: "You cannot move tasks to a board you don't own" });
            }
        }

        await task.update(req.body);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteTask(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const task = await Task.findByPk(req.params.id, {
            include: [{ model: Board, as: 'board' }]
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (userRole !== 'admin' && task.board.ownerId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        await task.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//for dashboard
async function getTasksByBoard(req, res) {
    try {
        const { boardId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const board = await Board.findByPk(boardId);

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        if (userRole !== 'admin' && board.ownerId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

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