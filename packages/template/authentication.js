const bcrypt = require('bcryptjs');
const saltRounds = 10;

mp.events.add('server:registerAccount', async (player, username, email, password) => {
    if(username.length >= 3 && password.length >= 5){
        if(validEmail(email)){
            try {
                const res = await attemptRegister(player, username, email, password);
                if(res){
                    console.log(`${username} has registered a new account.`)
                    if (player.idleKick) { 
                        clearTimeout(player.idleKick);
                        player.idleKick = null;
                    }
                    mp.events.call("server:loadAccount", player, username);
                    player.call('client:loginHandler', ['registered']);
                } else {
                    player.call('client:loginHandler', ['takeninfo']);
                    resetTimeout(player);
                }
            } catch(e) { console.log(e) };
        } else {
            player.call('client:loginHandler', ['invalid-info']);
            resetTimeout(player);
        }
    } else {
        player.call('client:loginHandler', ['tooshort']);
        resetTimeout(player);
    }    
});

mp.events.add('server:loginAccount', async (player, username, password) => {
    let loggedAccount = mp.players.toArray().find(p => p.name == username);
    if(!loggedAccount){
        try {
            const res = await attemptLogin(username, password);
            if(res){
                console.log(`${username} has successfully logged in.`);
                if (player.idleKick) { 
                    clearTimeout(player.idleKick);
                    player.idleKick = null;
                }
                mp.events.call("server:loadAccount", player, username);
                player.call('client:loginHandler', ['success']);
            } else {
                player.call('client:loginHandler', ['incorrectinfo']);
                resetTimeout(player);
            }
        } catch(e) { console.log(e) };
    } else {
        player.call('client:loginHandler', ['logged']);
    }
});

mp.events.add('server:loadAccount', async (player, username) => {
    try {
        const [rows] = await mp.db.query('SELECT * FROM `accounts` WHERE `username` = ?', [username]);
        if(rows.length != 0){
            player.sqlID = rows[0].ID;
            player.name = username;
            rows[0].position === null ? player.position = new mp.Vector3(mp.settings.defaultSpawnPosition) : player.position = new mp.Vector3(JSON.parse(rows[0].position));
            player.setVariable("loggedIn", true);
        }
    } catch(e) { console.log(`[MySQL] ERROR: ${e.sqlMessage}\n[MySQL] QUERY: ${e.sql}`) };
});

mp.events.add('playerJoin', (player) => {
    player.setVariable("loggedIn", false);
    timeoutKick(player);
});

mp.events.add('playerQuit', async (player) => {
    if(player.getVariable('loggedIn') === false) return;
    let name = player.name;
    try {
        const [status] = await mp.db.query('UPDATE `accounts` SET `position` = ? WHERE username = ?', [JSON.stringify(player.position), player.name]);
        if(status.affectedRows === 1) console.log(`${name}'s data successfully saved.`);
        console.log(`${name} has quit the server.`);
    } catch(e) { console.log(e) }
})

function attemptRegister(player, username, email, pass){
    return new Promise(async function(resolve, reject){
        try {
            await mp.db.query('SELECT * FROM `accounts` WHERE `username` = ? OR `email` = ?', [username, email]).then(([rows]) => {
                return rows.length === 0;
            }).then(function(result){
                if(result){
                    bcrypt.hash(pass, saltRounds).then(async function(hash){
                        await mp.db.query('INSERT INTO `accounts` SET `username` = ?, `email` = ?, `password` = ?, `socialClub` = ?, `socialClubId` = ?', [username, email, hash, player.socialClub, player.rgscId]).then(() => {
                            resolve(true);
                        }).catch(e => reject(`[MySQL] ERROR: ${e.sqlMessage}\n[MySQL] QUERY: ${e.sql}`));
                    }).catch(e => reject(e));
                } else {
                    resolve(false);
                }
            }).catch(e => reject(`[MySQL] ERROR: ${e.sqlMessage}\n[MySQL] QUERY: ${e.sql}`));
        } catch(e) { console.log(e) }
    });
}

function attemptLogin(username, password){
    return new Promise(async function(resolve){
        try {
            await mp.db.query('SELECT `username`, `password` FROM `accounts` WHERE `username` = ?; UPDATE `accounts` SET `lastActive` = now() WHERE username = ?', [username, username]).then(([rows]) => {
                return rows;
            }).then(function(result){
                if(result[0].length != 0){    //  Account found
                    bcrypt.compare(password, result[0][0].password).then(function(res){
                        res ? resolve(true) : resolve(false);
                    });
                } else {    //  No account found
                    resolve(false);
                }
            });
        } catch(e) { console.log(e) }
    });
}

function validEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function resetTimeout(user){
    if (user.idleKick) {
        clearTimeout(user.idleKick);
        user.idleKick = null;
    }
    timeoutKick(user);
}

function timeoutKick(user){
    user.idleKick = setTimeout(() => {
        user.call('client:hideLoginScreen');
        user.outputChatBox(`You were kicked for idling too long.`);
        user.kick();
    }, 60000);
}