const { Board, User } = require('../models');

async function createBoard(req, res) {
    try {
        const ownerId = req.user.id;
        const board = await Board.create({
            ...req.body,
            ownerId: ownerId
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function createBoardAdmin(req, res) {
    try {
        const { name, ownerId } = req.body;

        if (!ownerId) {
            return res.status(400).json({ message: "Wymagane jest podanie ID właściciela (ownerId)." });
        }

        const userExists = await User.findByPk(ownerId);
        if (!userExists) {
            return res.status(404).json({ message: `Użytkownik o ID ${ownerId} nie istnieje.` });
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

// 3. POBIERANIE LISTY (Dla Dashboardu - "Moje Tablice")
// Zwraca tylko tablice, których właścicielem jest zalogowany user (nawet jeśli to admin).
async function getAllBoards(req, res) {
    try {
        const ownerId = req.user.id;

        const boards = await Board.findAll({
            where: { ownerId: ownerId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }]
        });
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// 4. POBIERANIE LISTY (Dla Panelu Admina - "Wszystkie Tablice")
// Zwraca wszystko jak leci.
// backend/controllers/boardController.js

async function getAllBoardsAdmin(req, res) {
    try {
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

// ... reszta (createBoardAdmin, updateBoard itp.) bez zmian ...

// 5. POBIERANIE POJEDYNCZEJ TABLICY
// Admin widzi każdą, User tylko swoją.
async function getBoardById(req, res) {
    try {
        const { id, role } = req.user;

        // Budujemy warunek wyszukiwania
        const whereCondition = { id: req.params.id };

        // Jeśli NIE jest adminem, dodajemy wymóg bycia właścicielem
        if (role !== 'admin') {
            whereCondition.ownerId = id;
        }

        const board = await Board.findOne({
            where: whereCondition,
            include: [{ // Warto dołączyć usera, żeby wyświetlić właściciela
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

// 6. AKTUALIZACJA TABLICY
// Admin edytuje każdą, User tylko swoją.
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

        // Jeśli admin zmienia ownerId, warto sprawdzić czy nowy user istnieje (opcjonalne, ale bezpieczne)
        if (req.body.ownerId && role === 'admin') {
            const userExists = await User.findByPk(req.body.ownerId);
            if (!userExists) {
                return res.status(404).json({ message: `Target user ID ${req.body.ownerId} does not exist.` });
            }
        }

        await board.update(req.body);
        res.status(200).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// 7. USUWANIE TABLICY
// Admin usuwa każdą, User tylko swoją.
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