const bcrypt = require('bcrypt');
const saltRounds = 10;

mp.events.add('server:registerAccount', async (player, username, email, password) => {
    try {
        if(username.length >= 3 && password.length >= 5){
            if(validEmail(email)){
                await attemptRegister(player, username, email, password).then(res => {
                    if(res){
                        console.log(`${username} has registered a new account.`)
                        clearTimeout(player.idleKick);
                        mp.events.call("server:loadAccount", player, username);
                        player.call('client:loginHandler', ['registered']);
                    } else {
                        player.call('client:loginHandler', ['takeninfo']);
                        resetTimeout(player);
                    }
                }).catch(e => console.log(e));
            } else {
                player.call('client:loginHandler', ['invalid-info']);
                resetTimeout(player);
            }
        } else {
            player.call('client:loginHandler', ['tooshort']);
            resetTimeout(player);
        }    
    } catch(e) { console.log(e) };
});

mp.events.add('server:loginAccount', async (player, username, password) => {
    let loggedAccount = mp.players.toArray().find(p => p.name == username);
    if(!loggedAccount){
        try {
            await attemptLogin(username, password).then(res => {
                if(res){
                    console.log(`${username} has successfully logged in.`);
                    clearTimeout(player.idleKick);
                    mp.events.call("server:loadAccount", player, username);
                    player.call('client:loginHandler', ['success']);
                } else {
                    player.call('client:loginHandler', ['incorrectinfo']);
                    resetTimeout(player);
                }
            });
        } catch(e) { console.log(e) };
    } else {
        player.call('client:loginHandler', ['logged']);
    }
});

mp.events.add('server:loadAccount', async (player, username) => {
    try {
        await server.db.query('SELECT * FROM `accounts` WHERE `username` = ?', [username]).then(([rows]) => {
            player.sqlID = rows[0].ID;
            player.name = username;
            player.setVariable("loggedIn", true);
        });
    } catch(e) { console.log(e) };
});

mp.events.add('playerJoin', (player) => {
    player.setVariable("loggedIn", false);
    timeoutKick(player);
});

function attemptRegister(player, username, email, pass){
    return new Promise(async function(resolve, reject){
        try {
            await server.db.query('SELECT * FROM `accounts` WHERE `username` = ? OR `email` = ?', [username, email]).then(([rows]) => {
                return rows.length === 0;
            }).then(function(result){
                if(result){
                    bcrypt.hash(pass, saltRounds).then(async function(hash){
                        await server.db.query('INSERT INTO `accounts` SET `username` = ?, `email` = ?, `password` = ?, `socialClub` = ?, `socialClubId` = ?', [username, email, hash, player.socialClub, player.rgscId]).then(() => {
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
            await server.db.query('SELECT `username`, `password` FROM `accounts` WHERE `username` = ?; UPDATE `accounts` SET `lastActive` = now() WHERE username = ?', [username, username]).then(([rows]) => {
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
    clearTimeout(user.idleKick);
    timeoutKick(user);
}

function timeoutKick(user){
    user.idleKick = setTimeout(() => {
        user.call('client:hideLoginScreen');
        user.outputChatBox(`You were kicked for idling too long.`);
        user.kick();
    }, 60000);
}