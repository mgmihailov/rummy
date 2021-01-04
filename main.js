const { app, BrowserWindow, dialog, ipcMain } = require("electron");

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      //devTools: false,
    }
  });

  ipcMain.handle("display-dialog", async (evt, options) => {
    let result = await dialog.showMessageBoxSync(win, options);
    return result;
  });
  win.loadFile('index.html');
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});
