const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
    let win;
    
    // Create the browser window.
    win = new BrowserWindow({
        width: 1366,
        height: 768,
        minWidth: 1366,
        minHeight: 768,
        fullscreen: false,
        backgroundColor: '#369f93',
        transparent: false
    });
    
    // and load the index.html of the app.
    win.loadFile('index.html');
    
    // Node js server is going to run here
    let server = require('./server/server.js');
    
    // Open the DevTools.
    // win.openDevTools();
    
    // Emitted when the window is closed
    win.on('closed', function () {
        win = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});
