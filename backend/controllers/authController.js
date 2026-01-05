const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'This email is already registered' });
        }

        const existingName = await User.findOne({ where: { username } });
        if (existingName) {
            return res.status(409).json({ message: 'This username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({ message: "User registered successfully", userId: newUser.id });

    } catch (error) {
        console.error("Error user register:", error);
        res.status(500).json({ message: 'Server Error! While registering user' });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ where: { username } });
        let isPasswordValid = false;

        if (user) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        }

        if (!user || !isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        //tu wysyłamy obiekt user i token do AuthContext
        res.json({
            message: 'Logged in',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("Error user login:", error);
        res.status(500).json({ message: 'Server Error! While logging user' });
    }
}

module.exports = {
    login, register
};