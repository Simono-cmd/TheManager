const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Board = sequelize.define("Board", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    }, {
        tableName: 'boards',
        timestamps: false
    });

    return Board;
};
