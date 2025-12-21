const { DataTypes } = require('sequelize');

module.exports=(sequelize) => {
    const Task = sequelize.define(
        'Task',
        {
            id:{
                type: DataTypes.INT,
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
                type: DataTypes.ENUM('to do', 'in progress', 'completed', 'failed'),
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
            }
        },
        {
            tableName: 'tasks',
            timestamps: false,
        }
        );
    return Task;
};