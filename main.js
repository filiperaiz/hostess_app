const { app, BrowserWindow } = require('electron');

let win = null;

const createWindow = () => {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1200,
		height: 800
	});

	// and load the index.html of the app.
    win.loadFile('index.html');
    
    // Node js server is going to run here
    let server = require('./server/server.js')

    // Open the DevTools.
    win.openDevTools();
    
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
