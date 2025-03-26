const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
let logsPath = path.join(process.env.APPDATA, "Macromedia", "Flash Player", "Logs", "flashlog.txt");

const exeDir = process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('exe');
const customCSSPath = path.join(path.dirname(exeDir), 'custom.css');
const defaultCSSPath = path.join(__dirname, 'default.css');

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 100,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile("index.html");

  // Load CSS after window loads
  mainWindow.webContents.on('did-finish-load', () => {
    loadStyles();
  });

  watchLogFile();
});

function loadStyles() {
  // Check for custom CSS first
  if (fs.existsSync(customCSSPath)) {
    console.log('Loading custom CSS');
    const customCSS = fs.readFileSync(customCSSPath, 'utf8');
    mainWindow.webContents.insertCSS(customCSS)
      .then(() => console.log('Custom CSS loaded'))
      .catch(err => console.error('Error loading custom CSS:', err));
  } else {
    // Load default CSS if no custom CSS exists
    console.log('Loading default CSS');
    const defaultCSS = fs.readFileSync(defaultCSSPath, 'utf8');
    mainWindow.webContents.insertCSS(defaultCSS)
      .then(() => console.log('Default CSS loaded'))
      .catch(err => console.error('Error loading default CSS:', err));
  }
}

// Handle saving CSS file
ipcMain.on('save-css', (event, css) => {
  try {
    fs.writeFileSync(customCSSPath, css, 'utf8');
    console.log('CSS saved successfully');
    
    // Reload the CSS
    mainWindow.webContents.insertCSS(css)
      .then(() => console.log('New CSS applied'))
      .catch(err => console.error('Error applying new CSS:', err));
  } catch (err) {
    console.error('Error saving CSS:', err);
  }
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
    const recentLines = lines.slice(-10);

    for (const line of recentLines) {
      if (line.startsWith("NEW GAME")) {
        console.log("New game detected!");
        mainWindow.webContents.send('start-timer');
        // Clear the log file
        fs.writeFile(logsPath, '', (err) => {
          if (err) console.error("Error clearing log file:", err);
        });
        return;
      }
      else if (line.startsWith("GAME OVER")) {
        console.log("Game over detected!");
        mainWindow.webContents.send('stop-timer');
        // Clear the log file
        fs.writeFile(logsPath, '', (err) => {
          if (err) console.error("Error clearing log file:", err);
        });
        return;
      }
    }
  });
}