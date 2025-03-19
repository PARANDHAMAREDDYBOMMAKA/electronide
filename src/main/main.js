// src/main/main.js
const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const Store = require("electron-store").default;

if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname);
}

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../../build/index.html")}`;

  console.log("Loading URL:", startUrl);
  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  createMenu();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Folder",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
              properties: ["openDirectory"],
            });
            if (filePaths && filePaths.length > 0) {
              mainWindow.webContents.send("folder-opened", filePaths[0]);
              store.set("lastOpenedFolder", filePaths[0]);
            }
          },
        },
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+Shift+O",
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
              properties: ["openFile"],
            });
            if (filePaths && filePaths.length > 0) {
              const content = fs.readFileSync(filePaths[0], "utf8");
              mainWindow.webContents.send("file-opened", {
                path: filePaths[0],
                content,
              });
            }
          },
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow.webContents.send("save-requested");
          },
        },
        {
          label: "Save As",
          accelerator: "CmdOrCtrl+Shift+S",
          click: async () => {
            mainWindow.webContents.send("save-as-requested");
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: "About Simple IDE",
              message: "Simple IDE v1.0.0\nA lightweight code editor",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle("read-file", async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
});

ipcMain.handle("write-file", async (event, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
});

ipcMain.handle("read-directory", async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const result = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(dirPath, item.name);
        const isDirectory = item.isDirectory();

        return {
          name: item.name,
          path: itemPath,
          isDirectory,
          children: isDirectory ? [] : null,
        };
      })
    );
    return result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
});

ipcMain.handle("save-dialog", async () => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: "All Files", extensions: ["*"] }],
  });
  return filePath;
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  const lastFolder = store.get("lastOpenedFolder");
  if (lastFolder && mainWindow) {
    setTimeout(() => {
      mainWindow.webContents.send("folder-opened", lastFolder);
    }, 1000);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
