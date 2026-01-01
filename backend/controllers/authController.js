const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User} = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res){
    try{
        const{username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({message: "All fields required"});
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already registered' });
        }

        const existingName = await User.findOne({ where: { username } });
        if (existingName) {
            return res.status(400).json({ message: 'This username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({message: "User registered successfully", userId: newUser.id});

    } catch (error) {
        console.error("Error user register:", error);
        res.status(500).json({ message: 'Server Error! While registering user' });
    }
}

async function login(req, res) {
    try{
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User doesn\'t exist' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '6h' }
        );

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
    catch(error){
        console.error("Error user login:", error);
        res.status(500).json({ message: 'Server Error! While logging user' });
    }
}


module.exports = {
    login, register
}

