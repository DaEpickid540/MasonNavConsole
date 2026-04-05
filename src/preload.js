const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

contextBridge.exposeInMainWorld("kioskAPI", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (cfg) => ipcRenderer.invoke("save-config", cfg),
  saveCoordinates: (data) => ipcRenderer.invoke("save-coordinates", data),
  quit: () => ipcRenderer.invoke("quit"),
  // Resolve asset paths that work both in dev and after build
  assetPath: (file) => {
    // In dev: assets/ is relative to project root
    // After build: assets/ is in process.resourcesPath
    try {
      const base = path.dirname(path.dirname(__dirname));
      return path.join(base, "assets", file).replace(/\\/g, "/");
    } catch (e) {
      return `../assets/${file}`;
    }
  },
  dataPath: (file) => {
    try {
      const base = path.dirname(path.dirname(__dirname));
      return path.join(base, "data", file).replace(/\\/g, "/");
    } catch (e) {
      return `../data/${file}`;
    }
  },
});
