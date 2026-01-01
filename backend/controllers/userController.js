const bcrypt = require('bcryptjs');
const { User, Board, Task, TaskMember } = require('../models');

// Prosty i skuteczny Regex do walidacji emaila
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tworzenie użytkownika (Admin Panel)
async function createUser(req, res) {
    try {
        const { username, email, password, role } = req.body;

        // 1. Walidacja: Czy pola są wypełnione?
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Wszystkie pola (username, email, password) są wymagane." });
        }

        // 2. NOWOŚĆ: Walidacja formatu emaila
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Podany adres email ma nieprawidłowy format." });
        }

        // 3. Sprawdzenie duplikatów
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) return res.status(400).json({ message: "Email jest już zajęty." });

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: "Nazwa użytkownika jest już zajęta." });

        // 4. Haszowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// backend/controllers/userController.js

async function getAllUsers(req, res) {
    try {
        // 1. Pobieramy parametry z URL (np. ?page=2&limit=10)
        // Domyślnie strona 1, 10 elementów na stronę
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // 2. Obliczamy offset (ile rekordów pominąć)
        // Np. dla strony 2: (2 - 1) * 10 = pomiń 10 rekordów
        const offset = (page - 1) * limit;

        // 3. Pobieramy dane z paginacją
        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] // Najnowsi na górze
        });

        // 4. Zwracamy strukturę z metadanymi
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            users: rows // Tutaj są same dane
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Pobierz konkretnego usera
async function getUserById(req, res) {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { username, email, role, password } = req.body;

        // NOWOŚĆ: Jeśli admin zmienia email, sprawdzamy jego format
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: "Podany adres email ma nieprawidłowy format." });
        }

        // Przygotowanie danych do aktualizacji
        let updateData = { username, email, role };

        // Jeśli podano hasło, haszujemy je
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);

        const userResponse = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json(userResponse);
    } catch (error) {
        // Obsługa błędu unikalności (np. zmiana emaila na taki, który już istnieje)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Podany email lub nazwa użytkownika są już zajęte." });
        }
        res.status(400).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.destroy();
        res.status(204).send();
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: "Nie można usunąć użytkownika, ponieważ posiada przypisane dane (tablice/zadania)." });
        }
        res.status(500).json({ message: error.message });
    }
}

// --- Funkcje pomocnicze (Board/Task/Members) ---
async function getBoardsByUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id, {
            include: { model: Board, as: 'boards' }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTasksByUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: {
                model: Task,
                as: 'tasks',
                include: [{
                    model: Board,
                    as: 'board',
                    attributes: ['id', 'name']
                }],
                through: {
                    attributes: ['role', 'joinedAt']
                }
            },
            order: [[{ model: Task, as: 'tasks' }, 'createdAt', 'DESC']]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTaskMembersByUser(req, res) {
    try {
        const taskMembers = await TaskMember.findAll({ where: { userId: req.params.id } });
        res.json(taskMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getBoardsByUser,
    getTasksByUser,
    getTaskMembersByUser
};