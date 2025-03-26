const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
let logsPath = path.join(process.env.APPDATA, "Macromedia", "Flash Player", "Logs", "flashlog.txt");

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 100,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile("index.html");
  watchLogFile();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function watchLogFile() {
    if (!fs.existsSync(logsPath)) {
      console.error("Log file not found:", logsPath);
      return;
    }
  
    fs.watch(logsPath, { encoding: "utf8" }, (eventType, filename) => {
      checkLogForNewGame();
    });
}

function checkLogForNewGame() {
    fs.readFile(logsPath, "utf8", (err, data) => {
      if (err) return console.error("Error reading log file:", err);
  
      const lines = data.trim().split("\n");
      
      // Get the last few lines (adjust the number as needed)
      const recentLines = lines.slice(-10); // Check last 10 lines
  
      for (const line of recentLines) {
        if (line.startsWith("NEW GAME")) {
          mainWindow.webContents.send('start-timer');
          return; // Exit after finding NEW GAME
        }
        else if (line.startsWith("GAME OVER")) { 
          mainWindow.webContents.send('stop-timer');
          return; // Exit after finding GAME OVER
        }
      }
    });
  }