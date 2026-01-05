const { Board, User } = require('../models');

// dashboard
async function createBoard(req, res) {
    try {
        const { name } = req.body;
        const ownerId = req.user.id;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: "Board name is required" });
        }

        const board = await Board.create({
            name,
            ownerId: ownerId
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// dla admin panel
async function createBoardAdmin(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const { name, ownerId } = req.body;

        if (!name || !ownerId) {
            return res.status(400).json({ message: "Name and OwnerID are required" });
        }

        const userExists = await User.findByPk(ownerId);
        if (!userExists) {
            return res.status(404).json({ message: `User with ID ${ownerId} does not exist` });
        }

        const board = await Board.create({
            name,
            ownerId: ownerId
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// dla dashboard
async function getAllBoards(req, res) {
    try {
        const ownerId = req.user.id;

        const boards = await Board.findAll({
            where: { ownerId: ownerId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// dla admin panel pagination
async function getAllBoardsAdmin(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Board.findAndCountAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            boards: rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getBoardById(req, res) {
    try {
        const { id, role } = req.user;
        const whereCondition = { id: req.params.id };

        if (role !== 'admin') {
            whereCondition.ownerId = id;
        }

        const board = await Board.findOne({
            where: whereCondition,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }]
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found or access denied" });
        }
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateBoard(req, res) {
    try {
        const { id, role } = req.user;
        const whereCondition = { id: req.params.id };

        if (role !== 'admin') {
            whereCondition.ownerId = id;
        }

        const board = await Board.findOne({ where: whereCondition });

        if (!board) {
            return res.status(404).json({ message: "Board not found or access denied" });
        }

        const { name, ownerId } = req.body;
        let updateData = {};

        if (name && name.trim() !== '') {
            updateData.name = name;
        }

        if (role === 'admin' && ownerId) {
            const userExists = await User.findByPk(ownerId);
            if (!userExists) {
                return res.status(404).json({ message: `Target user ID ${ownerId} does not exist.` });
            }
            updateData.ownerId = ownerId;
        }

        await board.update(updateData);
        res.status(200).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteBoard(req, res) {
    try {
        const { id, role } = req.user;
        const whereCondition = { id: req.params.id };

        if (role !== 'admin') {
            whereCondition.ownerId = id;
        }

        const board = await Board.findOne({ where: whereCondition });

        if (!board) {
            return res.status(404).json({ message: "Board not found or access denied" });
        }

        await board.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createBoard,
    createBoardAdmin,
    getAllBoards,
    getAllBoardsAdmin,
    getBoardById,
    updateBoard,
    deleteBoard,
};