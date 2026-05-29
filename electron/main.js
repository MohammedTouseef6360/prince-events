const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let devServer;

const isDev = !app.isPackaged;

function startDevServer() {
  return new Promise((resolve, reject) => {
    devServer = spawn("npx", ["next", "dev", "-p", "3456"], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: { ...process.env },
    });

    devServer.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("http://localhost:3456")) {
        resolve();
      }
    });

    devServer.stderr.on("data", (data) => {
      const output = data.toString();
      if (output.includes("http://localhost:3456")) {
        resolve();
      }
    });

    devServer.on("error", reject);
    setTimeout(() => reject(new Error("Dev server timeout")), 30000);
  });
}

async function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: "PRINCE EVENT'S",
    icon: path.join(__dirname, "..", "public", "favicon.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3456");
  }
}

app.whenReady().then(async () => {
  try {
    await startDevServer();
    await createWindow();
  } catch (err) {
    console.error("Failed to start:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (devServer) devServer.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
