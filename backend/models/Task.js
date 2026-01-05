const { DataTypes } = require('sequelize');

module.exports=(sequelize) => {
    const Task = sequelize.define(
        'Task',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title:{
                type: DataTypes.STRING,
                allowNull: false
            },
            description:{
                type: DataTypes.STRING,
                allowNull: true
            },
            status:{
                type: DataTypes.ENUM('to do', 'completed'),
                defaultValue: 'to do'
            },
            boardId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            deadline: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            tableName: 'tasks',
            timestamps: false,
        }
        );
    return Task;
};