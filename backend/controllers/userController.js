const { Board, User, TaskMember, Task} = require('../models');


//basic CRUD
async function createUser(req,res) {
    try{
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
}

async function getAllUsers(req,res) {
    try{
        const users = await User.findAll();
        res.status(200).json(users);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

async function getUserById(req,res) {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

async function updateUser(req,res) {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        await user.update(req.body);
        res.status(200).json(user);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
}

async function deleteUser(req,res){
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        await user.destroy();
        res.status(204).send();
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

//additional methods

async function getBoardsByUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id, { include: { model: Board, as: 'boards' }});
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTasksByUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id, {
            include: { model: Task, as: 'tasks', through: { attributes: ['role','joinedAt'] } }
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

module.exports={
    createUser, getAllUsers, getUserById, updateUser, deleteUser, getBoardsByUser, getTasksByUser, getTaskMembersByUser
}