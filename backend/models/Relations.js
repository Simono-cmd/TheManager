module.exports = (sequelize) => {
    const {User, Board, Task, TaskMember} = sequelize.models;

    // User - Board (1 to many)
    User.hasMany(Board, {foreignKey: 'ownerId', as: 'boards'});
    Board.belongsTo(User, {foreignKey: 'ownerId', as: 'owner'});

    // Board - Task (1 to many)
    Board.hasMany(Task, {foreignKey: 'boardId', as: 'tasks'});
    Task.belongsTo(Board, {foreignKey: 'boardId', as: 'board'});

    // Task - User (many to many) (through TaskMember)
    Task.belongsToMany(User, {
        through: TaskMember,
        foreignKey: 'taskId',
        otherKey: "userId",
        as: 'members',
    });

    User.belongsToMany(Task, {
        through: TaskMember,
        foreignKey: 'userId',
        otherKey: 'taskId',
        as: 'tasks',
    })

    //for extracting data from TaskMember:
    TaskMember.belongsTo(Task, {foreignKey: 'taskId', as: 'task'});
    TaskMember.belongsTo(User, {foreignKey: 'userId', as: 'user'});
}