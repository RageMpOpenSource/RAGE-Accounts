mp.events.delayInitialization = true;   //  Setting this to true won't allow players to connect until this is false again

//  Step 1 - Required before anything else
const fs = require('fs');
const esc = `\x1b`;
const sgr = (...args) => `${esc}[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`); // Changes color of the text from RGB. sgrRgbFg(r, g, b)
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`); // Changes color of text's background from RGB. sgrRgbBg(r, g, b)
mp.colors = {
    normal: sgrRgbFg(192, 192, 192),
    red: (text) => sgrRgbFg(192, 0, 0) + text + mp.colors.normal,
    yellow: (text) => sgrRgbFg(192, 192, 0) + text + mp.colors.normal,
    black: (text) =>sgrRgbFg(0, 0, 0) + text + mp.colors.normal,
    green: (text) => sgrRgbFg(0, 192, 0) + text + mp.colors.normal,
    grey: (text) => sgrRgbFg(192, 192, 192) + text + mp.colors.normal,
}

//  Step 2 - Obtaining and loading config file
if (!fs.existsSync(__dirname + '/settings.json')) {
    console.log(`${mp.colors.red('You do not have a \'settings.json\' file setup.')}`);
    process.exit(0);
} else {
    mp.settings = require('./settings.json');
}

//  Step 3 - Load up gamemode assets
mp.db = require('mysql2/promise').createPool({host: mp.settings.db_host, user: mp.settings.db_username, password: mp.settings.db_password, database: mp.settings.db_name, connectionLimit: mp.settings.db_connectionLimit, multipleStatements: true});
mp.test = require('./test.js');
require('./authentication.js');

//  Step 4 - Wait for everything to load, then allow connections once all is loaded
(async () => {
    await initializeDatabase();
    await mp.test.init();
    mp.events.delayInitialization = false;    //  Players cannot join until this is false
})();

async function initializeDatabase(){
    try {
        const conn = await mp.db.getConnection();
        if(conn){
            console.log(mp.colors.green('Database Connected successfully.'));
            conn.release();
            return;
        }
    } catch(err) {
        console.log(mp.colors.red('Database failed to connect'))
        if(!err.code) return console.log(mp.colors.red(err));
        switch(err.code){
            case 'PROTOCOL_CONNECTION_LOST':
                console.log(mp.colors.red('Database connection was closed.'));
                break;
            case 'ER_CON_COUNT_ERROR':
                console.log(mp.colors.red('Database has too many connections.'));
                break;
            case 'ECONNREFUSED':
                console.log(mp.colors.red('Check your connection details (packages/template/config.json) or make sure your MySQL mp is running.'));
                break;
            case 'ER_BAD_DB_ERROR':
                console.log(mp.colors.red('The database name you\'ve entered does not exist. Ensure the details inside your config file are correct (packages/template/config.json).'));
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.log(mp.colors.red('Check your MySQL username and password and make sure they\'re correct.'));
                break;
            case 'ENOENT':
                console.log(mp.colors.red('There is no internet connection. Check your connection and try again.'));
                break;
            case 'ENOTFOUND':
                console.log(mp.colors.red('Database host not found.'));
                break;
            default:
                console.log(err);
                break;
            }
    }
}

mp.db.on('enqueue', function () {
    console.log(`${mp.colors.red('[WARNING] You have hit the database connection limit and queries are waiting to be executed, this results in slower results for any pending queries.')}`);
});