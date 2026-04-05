const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(app.getPath("userData"), "kiosk-config.json");
const DEFAULTS = {
  kioskName: "Mason High School",
  defaultRoom: "A11",
  defaultFloor: 1,
  devMode: false, // set true to run windowed with devtools
  idleTimeout: 30,
  fontSize: "normal",
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH))
      return {
        ...DEFAULTS,
        ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")),
      };
  } catch (e) {}
  return { ...DEFAULTS };
}
function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (e) {}
}

let win;
function createWindow() {
  const cfg = loadConfig();
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    fullscreen: !cfg.devMode,
    kiosk: !cfg.devMode,
    frame: cfg.devMode,
    autoHideMenuBar: true,
    backgroundColor: "#0d1a0d",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => {
    win.show();
    if (cfg.devMode) win.webContents.openDevTools();
  });

  // Block navigation away from app
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) e.preventDefault();
  });

  // Keyboard shortcuts
  win.webContents.on("before-input-event", (_, input) => {
    if (input.control && input.shift && input.key === "D")
      win.webContents.toggleDevTools();
    if (input.control && input.key.toLowerCase() === "q") app.quit();
  });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

ipcMain.handle("get-config", () => loadConfig());
ipcMain.handle("save-config", (_, c) => {
  saveConfig(c);
  return true;
});
ipcMain.handle("save-coordinates", (_, data) => {
  try {
    const { floor, roomName, x, y } = data;
    const coordFilePath = path.join(
      __dirname,
      "..",
      "data",
      `coordinates_floor${floor}.js`,
    );

    // Read the current file
    let content = fs.readFileSync(coordFilePath, "utf8");

    // Parse the existing coordinates object
    const coordsMatch = content.match(/const COORDS = ({[\s\S]*?});/);
    if (!coordsMatch) {
      return {
        success: false,
        error: "Could not parse coordinates file format",
      };
    }

    // Create the replacement string for this room
    const oldPattern = new RegExp(
      `${roomName}:\\s*{\\s*x:\\s*[\\d.]+,\\s*y:\\s*[\\d.]+\\s*}`,
    );
    const newCoordStr = `${roomName}: { x: ${x}, y: ${y} }`;

    // Replace the specific room's coordinates
    const newContent = content.replace(oldPattern, newCoordStr);

    // If no replacement was made, it might be a new room or the format is different
    if (newContent === content) {
      return {
        success: false,
        error: "Could not find room in coordinates file",
      };
    }

    // Write the updated content back
    fs.writeFileSync(coordFilePath, newContent, "utf8");

    return { success: true };
  } catch (error) {
    console.error("Error saving coordinates:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle("quit", () => app.quit());
ipcMain.handle("get-path", (_, key) => {
  // Let renderer ask for asset paths safely
  if (key === "assets") return path.join(process.resourcesPath, "assets");
  if (key === "data") return path.join(process.resourcesPath, "data");
  return null;
});
