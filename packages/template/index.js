mp.events.delayInitialization = true;   //  Setting this to true won't allow players to connect until this is false again

//  Step 1 - Required before anything else
const fs = require('fs');

//  Step 2 - Obtaining and loading config file
if (!fs.existsSync(__dirname + '/settings.json')) {
    console.log(`${'You do not have a \'settings.json\' file setup.'}`);
    process.exit(0);
} else {
    mp.settings = require('./settings.json');
}

//  Step 3 - Load up gamemode assets
mp.db = require('mysql2/promise').createPool({host: mp.settings.db_host, user: mp.settings.db_username, password: mp.settings.db_password, database: mp.settings.db_name, connectionLimit: mp.settings.db_connectionLimit, multipleStatements: true});
mp.test = require('./test.js');
require('./authentication.js');
const database = require('./database.js');

//  Step 4 - Wait for everything to load, then allow connections once all is loaded
(async () => {
    try {
        await database.initializeDatabase();
        await mp.test.init();
        mp.events.delayInitialization = false;    //  Players cannot join until this is false
    } catch(e) {
        console.log(e)
    }
})();