var loginBrowser, loginCam;

mp.events.add('client:loginData', (username, password) => {
    mp.events.callRemote("server:loginAccount", username, password);
});

mp.events.add('client:registerData', (username, email, password) => {
    mp.events.callRemote("server:registerAccount", username, email, password);
});


mp.events.add('client:loginHandler', (handle) => {
    switch(handle){
        case 'success':
        {
            mp.gui.chat.push('Welcome back to the server!');
            mp.events.call('client:hideLoginScreen');
            break;
        }
        case 'registered':
        {
            mp.gui.chat.push('Registration successful. Welcome to the server!');
            mp.events.call('client:hideLoginScreen');
            break;
        }
        case 'incorrectinfo':
        {
            loginBrowser.execute(`$('.incorrect-info').show(); $('#loginBtn').show();`);
            break;
        }
        case 'takeninfo':
        {
            loginBrowser.execute(`$('.taken-info').show(); $('#registerBtn').show();`);
            break;
        }
        case 'tooshort':
        {
            loginBrowser.execute(`$('.short-info').show(); $('#registerBtn').show();`);
            break;
        }
        case 'logged':
        {
            loginBrowser.execute(`$('.logged').show(); $('#loginBtn').show();`);
            break;
        }
        case 'invalid-info':
        {
            loginBrowser.execute(`$('.invalid-info').show(); $('#registerBtn').show();`);
            break;
        }
        case 'banned':
        {
            loginBrowser.execute(`$('.banned').show();`);
            break;
        }
        default:
        {
            break;
        }
        }
});

mp.events.add('client:showLoginScreen', () => {
    loginBrowser = mp.browsers.new('package://cef/login/index.html');
    mp.players.local.freezePosition(true);
    mp.game.ui.setMinimapVisible(true);
    mp.gui.chat.activate(false);
    mp.gui.chat.show(false);
    setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
    mp.game.ui.displayRadar(false);
    mp.events.call('client:enableCamera');
});

mp.events.add('client:hideLoginScreen', () => {
    loginBrowser.destroy();
    mp.players.local.freezePosition(false);
    mp.game.ui.setMinimapVisible(false);
    mp.gui.chat.activate(true);
    mp.gui.chat.show(true);
    mp.gui.cursor.show(false, false);
    mp.game.ui.displayRadar(true);
    mp.events.call("client:disableCamera");
});

mp.events.add('client:enableCamera', () => {
    loginCam = mp.cameras.new('default', new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0), 40);
    mp.players.local.position = new mp.Vector3(-1757.12, -739.53, 10);
    mp.players.local.freezePosition(true);

    loginCam.setActive(true);
    loginCam.setCoord(-1757.12, -739.53, 25);
    loginCam.pointAtCoord(-1764, -715, 35);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
});

mp.events.add('client:disableCamera', () => {
    loginCam.destroy();
    mp.game.cam.renderScriptCams(false, false, 0, false, false);
    mp.players.local.freezePosition(false);
});