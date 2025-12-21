const sequelize = require('./database/db');

sequelize.authenticate()
    .then(() => {
        console.log('Połączono z bazą SQLite');
    })
    .catch(err => {
        console.error('Błąd połączenia:', err);
    });
