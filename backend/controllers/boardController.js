const { Board } = require('../models');

//basic CRUD
async function createBoard(req, res) {
    try {
        const board = await Board.create(req.body);
        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllBoards(req, res) {
    try {
        const boards = await Board.findAll();
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getBoardById(req, res) {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateBoard(req, res) {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        await board.update(req.body);
        res.status(200).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteBoard(req, res) {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        await board.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createBoard,
    getAllBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
};
