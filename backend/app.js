require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database/db');

require('./models/Relations');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/task-members', require('./routes/taskMemberRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
const PORT = process.env.PORT;

db.sync({ force: false })
    .then(() => {
        console.log('SQLITE: connected.');
        app.listen(PORT, () => {
            console.log(`Server works on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('DB ERROR:', err);
    });