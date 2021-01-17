# RAGE Accounts

A MySQL boilerplate to quickly create an account system without all the work. This handles both logging in and registration. This also utilised the delayedInitilisation feature added in RAGE:MP 1.1 to allow time for your database and any other assets on your server to be loaded first before allowing any user connections. By using this feature, this avoids any errors of users connecting before your resources are done loading. Read below for more information. A custom config file has also been used to easily change your database variables (username/database name/database password) and will allow you to easily add more configuration options going forward.

## Features
- CEF Login/Registration pages with error handling
- Idle Kicker (Kicks any player who is sitting on the login/register pages after 60 seconds of no attempts)
- Promise based loading
- Easy imported SQL into your MySQL database

## Installation
### Prerequisits
- NodeJS
- MySQL Server

### Steps
1. Clone/Download this repo and place it inside of your server folder
2. Open your command prompt and change your directory of your command prompt to the server folder and then type `npm install`
    - You could also Shift + Right click inside your server folder and 'Open PowerShell window here' and type `npm install` if you don't know how to do the above step
3. Head to `packages/<folder>/settings.example.json` and rename the file to `settings.json` (Remove the .example from the file name)
4. Open up the `settings.json` file and edit the database details to connect to your server, if you're running it locally the default settings may be fine.
5. Using the .sql file inside the server folder, run this inside your database to set it up.
    - I won't be going into how to do this, Google "How to set up a MySQL server" if you don't know how to do this as I won't be offering support.
6. Run your server, if there are no errors and it prints "Database connected successfully" then you're all done.

## Extra Information
## Database Schema
- Username
- Email
- Password (Encryted using BCrypt)
- Registration Date
- Last Active (Updated each time you login)
- Social Club
- Social Club ID
- Position

## Limitations
- This doesn't include password recovery, this will need to be setup yourself.
- There is a banned handler clientside to block logins of banned players, but there is no banning system put in place, you will need to set this up (This requires an admin system and this isn't included).

## Player Variables
- loggedIn : Boolean (True when the player is logged in, False when they're on the login/registration page)
- username : String (Holds the players username, the one they login with and not the name they join the server with. This is used for checking if this player is already logged in.
- sqlID (Server-side only) : Integer (Holds the player's Database/SQL ID)

## Changing login/register pages
These can easily be changed out, all you have to do is send data to the client calling `client:registerData` or `client:loginData`
- mp.trigger('client:loginData', loginName, loginPass);
- mp.trigger('client:registerData', registerName, registerEmail, registerPass);

From inside CEF I call a function `sendAccountInfo(state)` where state is either 0 (Login) or 1(Register) and this function then grabs the data filled out inside the form to then send it to either of the events mentioned above. This function can be found inside `client_packages/cef/login/main.js`


## Delayed Initilisation
RAGE:MP introduced a [delayed initilisation](https://wiki.rage.mp/index.php?title=Events::delayInitialization) feature so servers can properly load their resources before allowing connections.

Inside `packages/<folder>/index.js` there is a self-executing anonymous async function (line 20 or look for the "Step 4" comment) which runs as soon as the server starts. For each resource you need knowledge around promises in order to utilise this function properly. I've added a 'test' package to show when a package takes a couple seconds to load, the server won't accept connections until it's done. This setup doesn't need to be used however it is highly recommended that you continue using this method when creating your server for smooth start ups.
