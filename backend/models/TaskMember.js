const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const TaskMember = sequelize.define("TaskMember", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('owner', 'member'),
            defaultValue: 'member'
        },
        joinedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'task_members',
        timestamps: false
    });

    return TaskMember;
};
