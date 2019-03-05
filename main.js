const { app, BrowserWindow} = require('electron');
const path = require('path')
let win = null;

const createWindow = () => {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1920,
        height: 1080,
        fullscreen: false,
        backgroundColor: '#369f93',
        transparent: false,
        icon: path.join(__dirname, '/assets/icons/mac/icon.icns')
	});

	// and load the index.html of the app.
    win.loadFile('index.html');
    
    // Node js server is going to run here
    let server = require('./server/server.js')

    // Open the DevTools.
    // win.openDevTools();
    
    // Emitted when the window is closed
	win.on('closed', function() {
		win = null;
	});
};

const closedWindow = () => {
	if (process.platform != 'darwin') {
		app.quit();
	}
};

app.on('ready', createWindow);
app.on('window-all-closed', closedWindow);
