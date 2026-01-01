const sequelize = require('../database/db');

const User = require('./User')(sequelize);
const Board = require('./Board')(sequelize);
const Task = require('./Task')(sequelize);
const TaskMember = require('./TaskMember')(sequelize);

require('./relations')(sequelize);

module.exports = {
    sequelize,
    User,
    Board,
    Task,
    TaskMember
};
