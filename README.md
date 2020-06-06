# RAGE Accounts
**NOTE: Requires RAGE:MP 1.1**

A MySQL boilerplate to quickly create an account system without all the work. This handles both logging in and registration. This also utilised the delayedInitilisation feature added in RAGE:MP 1.1 to allow time for your database and any other assets on your server to be loaded first before allowing any user connections. By using this feature, this avoids any errors of users connecting before your resources are done loading. Read below for more information. A custom config file has also been used to easily change your database variables (username/database name/database password) and will allow you to easily add more configuration options going forward.

## Features
- CEF Login/Registration pages with error handling
- Idle Kicker (Kicks any player who is sitting on the login/register pages after 60 seconds of no attempts)
- Promise based loading
- Easy imported SQL into your MySQL database

## Database Schema
- Username
- Email
- Password (Encryted using BCrypt)
- Registration Date
- Last Active (Updated each time you login)
- Social Club
- Social Club ID

## Limitations
- This doesn't include password recovery, this will need to be setup yourself.
- There is a banned handler clientside to block logins of banned players, but there is no banning system put in place, you will need to set this up (This requires an admin system and this isn't included).

## Player Variables
- loggedIn : Boolean (True when the player is logged in, False when they're on the login/registration page)

## Delayed Initilisation
RAGE:MP introduced a [delayed initilisation](https://wiki.rage.mp/index.php?title=Events::delayInitialization) feature so servers can properly load their resources before allowing connections.

Inside packages/folder/index.js there is a self-executing anonymous async function (line 23 or look for the "Step 4" comment) which runs as soon as the server starts. For each resource you need knowledge around promises in order to utilise this function properly. I've added a 'test' package to also see even when a package takes a couple seconds to load, the server won't accept connections until it's done. This doesn't need to be used however it is highly recommended that you continue using this method when creating your server.