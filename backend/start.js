const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SQL_FILE = './database/sample.sql';
const FRONTEND_DIR = '../frontend';
const FRONTEND_CMD = 'npm run dev';
const BACKEND_CMD = 'npm start';

const sequelize = require('./database/db');
const models = require('./models');

const run = async () => {
    try {
        console.log('----- CREATING DATABASE -------');

        await sequelize.sync({ force: true });
        console.log('All tables created');

        console.log(`-------- LOADING SQL FROM ${SQL_FILE} -------`);

        const sqlPath = path.join(__dirname, SQL_FILE);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        const queries = sqlContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            await sequelize.query(query);
        }
        console.log('SQL queries executed correctly');

        console.log('------ STARTING SYSTEM ------');

        const npx = 'npx.cmd';

        const frontendScript = `\"${FRONTEND_CMD} --prefix ${FRONTEND_DIR}\"`;
        const backendScript = `\"${BACKEND_CMD}\"`;

        console.log(`> Frontend cmd: ${frontendScript}`);
        console.log(`> Backend cmd:  ${backendScript}`);

        const child = spawn(npx, [
            'concurrently',
            '-n', 'SERVER,CLIENT',
            '-c', 'blue,green',
            backendScript,
            frontendScript
        ], { stdio: 'inherit', shell: true });

        child.on('close', (code) => {
            process.exit(code);
        });

    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

run();