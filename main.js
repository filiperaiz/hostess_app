const { app, BrowserWindow, nativeImage, Tray} = require('electron');
const path = require('path')


app.on('ready', () => {
    let win;

    let img = 'assets/icons/1024x1024.png'

    let icon1 = new Tray(img)
    let icon2 = nativeImage.createFromPath(img)
    let icon3 = img
    let icon4 = path.join(__dirname, img)


	// Create the browser window.
	win = new BrowserWindow({
		width: 1366,
        height: 768,
        minWidth: 1366,
        minHeight: 768,
        fullscreen: false,
        backgroundColor: '#369f93',
        transparent: false,
        icon: icon4
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

    // console.log(`appIcon = ${icon1}`);
    // console.log(`image = ${icon2}`);
    // console.log(`icon = ${icon3}`);
    console.log(`path = ${icon4}`);
});
app.on('window-all-closed', () => {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

