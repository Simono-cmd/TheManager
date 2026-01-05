const bcrypt = require('bcryptjs');
const { User, Board, Task, TaskMember } = require('../models');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function createUser(req, res) {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Incorrect email format" });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) return res.status(400).json({ message: "Email already taken" });

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        let roletosave = 'user';

        const requestByAdmin = req.user && req.user.role === 'admin';
        if (requestByAdmin) {
            if (role) {
                roletosave = role;
            } else {
                roletosave = 'user';
            }
        }

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: roletosave
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            users: rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUserById(req, res) {
    try {
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

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
        const targetId = parseInt(req.params.id);

        if (req.user.role !== 'admin' && req.user.id !== targetId) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { username, email, role, password } = req.body;
        let updateData = {};

        if (email) {
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Incorrect email format" });
            }
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail && existingEmail.id !== targetId) {
                return res.status(409).json({ message: "Email already taken" });
            }
            updateData.email = email;
        }

        if (username) {
            const existingName = await User.findOne({ where: { username } });
            if (existingName && existingName.id !== targetId) {
                return res.status(409).json({ message: "Username already taken" });
            }
            updateData.username = username;
        }

        if (req.user.role === 'admin' && role) {
            updateData.role = role;
        }

        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);

        const userResponse = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getBoardsByUser(req, res) {
    try {
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

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
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

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
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

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