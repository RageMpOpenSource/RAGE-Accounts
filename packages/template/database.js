async function initializeDatabase(){
    try {
        const conn = await mp.db.getConnection();
        if(conn){
            console.log('Database Connected successfully.');
            conn.release();
            return;
        }
    } catch(err) {
        console.log('Database failed to connect')
        if(!err.code) return console.log(err);
        switch(err.code){
            case 'PROTOCOL_CONNECTION_LOST':
                console.log('Database connection was closed.');
                break;
            case 'ER_CON_COUNT_ERROR':
                console.log('Database has too many connections.');
                break;
            case 'ECONNREFUSED':
                console.log('Check your connection details (packages/template/config.json) or make sure your MySQL mp is running.');
                break;
            case 'ER_BAD_DB_ERROR':
                console.log('The database name you\'ve entered does not exist. Ensure the details inside your config file are correct (packages/template/config.json).');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.log('Check your MySQL username and password and make sure they\'re correct.');
                break;
            case 'ENOENT':
                console.log('There is no internet connection. Check your connection and try again.');
                break;
            case 'ENOTFOUND':
                console.log('Database host not found.');
                break;
            default:
                console.log(err);
                break;
            }
    }
}

mp.db.on('enqueue', function () {
    console.log(`${'[WARNING] You have hit the database connection limit and queries are waiting to be executed, this results in slower results for any pending queries.'}`);
});

module.exports = {
    initializeDatabase
}