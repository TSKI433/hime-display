import * as path from 'path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'

const loadURL = import.meta.env.PROD
  ? `file://${path.resolve(__dirname, '../renderer/index.html')}`
  : process['env'].RENDERER_URL || 'http://localhost:3000'

function createWindow() {
  const mainWindow = new BrowserWindow({ 
    width: 800,
    height: 600,
    icon: path.resolve(__dirname, '../../public/icons/256x256.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs.js'),
    }
  })

  mainWindow.loadURL(loadURL)

  // mainWindow.webContents.openDevTools()

  ipcMain.handle('show-dialog', (event, arg) => {
    dialog.showMessageBoxSync(mainWindow, {
      message: `received message from renderer process: ${arg}`
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
