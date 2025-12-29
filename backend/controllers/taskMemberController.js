const { TaskMember, Task } = require('../models');

//basic CRUD
async function createTaskMember(req, res) {
    try {
        const member = await TaskMember.create(req.body);
        res.status(201).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllTaskMembers(req, res) {
    try {
        const members = await TaskMember.findAll();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTaskMemberById(req, res) {
    try {
        const member = await TaskMember.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: "TaskMember not found" });
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateTaskMember(req, res) {
    try {
        const member = await TaskMember.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: "TaskMember not found" });
        await member.update(req.body);
        res.status(200).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteTaskMember(req, res) {
    try {
        const member = await TaskMember.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: "TaskMember not found" });
        await member.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createTaskMember,
    getAllTaskMembers,
    getTaskMemberById,
    updateTaskMember,
    deleteTaskMember
};
