const { app, BrowserWindow, nativeImage} = require('electron');
const path = require('path')

let demoIcon = nativeImage.createFromPath(path.join(__dirname,'assets','icons', 'png','512x512.png'))

let win;

app.on('ready', () => {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1920,
        height: 1080,
        fullscreen: false,
        backgroundColor: '#369f93',
        transparent: false,
        icon: demoIcon
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
});
app.on('window-all-closed', () => {
	if (process.platform != 'darwin') {
		app.quit();
	}
});
