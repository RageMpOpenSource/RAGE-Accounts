global.server = {};
mp.events.delayInitialization = true;   //  Setting this to true won't allow players to connect until this is false again

//  Step 1 - Required before anything else
const fs = require('fs');
server.chalk = require('chalk');


//  Step 2 - Obtaining and loading config file
if(!fs.existsSync(__dirname + '/config.json')){
    console.log(`${server.chalk.red('You do not have a \'config.json\' file setup.')}`);
    process.exit(0);
} else {
    server.config = require('./config.json');
}

//  Step 3 - Load up gamemode assets
server.db = require('mysql2/promise').createPool({host: server.config.db_host, user: server.config.db_username, password: server.config.db_password, database: server.config.db_name, connectionLimit: server.config.db_connectionLimit, multipleStatements: true});
server.test = require('./test.js');
require('./authentication.js');

//  Step 4 - Wait for everything to load, then allow connections once all is loaded
(async () => {
    await initializeDatabase();
    await server.test.init();
    mp.events.delayInitialization = false;    //  Players cannot join until this is false
})();

async function initializeDatabase(){
    await server.db.getConnection().then(conn => {
        console.log(server.chalk.green('Database Connected successfully.'));
        conn.release();
        return;
    }).catch(err => {
        console.log(server.chalk.red('Database failed to connect'))
        if(!err.code) return console.log(server.chalk.red(err));
        switch(err.code){
            case 'PROTOCOL_CONNECTION_LOST':
                console.log(server.chalk.red('Database connection was closed.'));
                break;
            case 'ER_CON_COUNT_ERROR':
                console.log(server.chalk.red('Database has too many connections.'));
                break;
            case 'ECONNREFUSED':
                console.log(server.chalk.red('Check your connection details (packages/template/config.json) or make sure your MySQL server is running.'));
                break;
            case 'ER_BAD_DB_ERROR':
                console.log(server.chalk.red('The database name you\'ve entered does not exist. Ensure the details inside your config file are correct (packages/template/config.json).'));
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.log(server.chalk.red('Check your MySQL username and password and make sure they\'re correct.'));
                break;
            case 'ENOENT':
                console.log(server.chalk.red('There is no internet connection. Check your connection and try again.'));
                break;
            case 'ENOTFOUND':
                console.log(server.chalk.red('Database host not found.'));
                break;
            default:
                console.log(err);
                break;
            }
    });
}