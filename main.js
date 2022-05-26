// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, screen} = require('electron')
const path = require('path')
const fs = require('fs')

app.commandLine.appendSwitch('ignore-certificate-errors')

function createWindow () {
	// Create the browser window.
	var dimensions = screen.getPrimaryDisplay().size;
	const mainWindow = new BrowserWindow({
		width: dimensions.width*0.8,
		height: 770,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			devTools: true
		}
	})
	mainWindow.webContents.openDevTools();

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Comunication
const lockfile = 'C:\\Riot Games\\League of Legends\\lockfile'

function read_file (filename) {
	try {
		const data = fs.readFileSync(filename, 'utf8')
		return (data)
	} catch (err) {
		console.error(err)
	}
}

ipcMain.on('main-lockfile', (event, arg) => {
	console.log(arg)
	event.reply('render-lockfile', read_file(lockfile))
})

ipcMain.on('main-champion_ids', (event, arg) => {
	console.log(arg)
	event.reply('render-champion_ids', read_file("champids.json"))
})