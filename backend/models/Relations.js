module.exports = (sequelize) => {
    const {User, Board, Task, TaskMember} = sequelize.models;

    // User - Board (1 to many)
    User.hasMany(Board, {
        foreignKey: 'ownerId',
        as: 'boards',
        onDelete: 'CASCADE',
        hooks: true
    });
    Board.belongsTo(User, { foreignKey: 'ownerId', as: 'user' });

    // Board - Task (1 to many)
    Board.hasMany(Task, {
        foreignKey: 'boardId',
        as: 'tasks',
        onDelete: 'CASCADE',
        hooks: true
    });
    Task.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

    // Task - User (many to many) (through TaskMember)
    Task.belongsToMany(User, {
        through: TaskMember,
        foreignKey: 'taskId',
        otherKey: "userId",
        as: 'members',
        onDelete: 'CASCADE'
    });

    User.belongsToMany(Task, {
        through: TaskMember,
        foreignKey: 'userId',
        otherKey: 'taskId',
        as: 'tasks',
        onDelete: 'CASCADE'
    });

    //for extracting data from TaskMember:
    TaskMember.belongsTo(Task, {
        foreignKey: 'taskId',
        as: 'task',
        onDelete: 'CASCADE'
    });

    TaskMember.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
    });}