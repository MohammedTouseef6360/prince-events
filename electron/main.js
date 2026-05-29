const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

let mainWindow;
const isDev = !app.isPackaged;

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: "PRINCE EVENT'S",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "public", "favicon.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("https://prince-events.vercel.app");
    mainWindow.setResizable(true);
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
