import {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  MenuItemConstructorOptions
} from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import { NavEvent } from "../common/events";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null;
let menu: Menu | null = null;

function getMenuTemplate(): MenuItemConstructorOptions[] {
  return [
    {
      label: app.getName(),
      submenu: [
        {
          label: "Quit",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Markdown editor test",
          click: () => {
            mainWindow &&
              mainWindow.webContents.send("nav", NavEvent.MARKDOWN_TEST);
          }
        },
        {
          label: "Test Page 2",
          click: () => {
            mainWindow &&
              mainWindow.webContents.send("nav", NavEvent.TEST_PAGE_2);
          }
        }
      ]
    }
  ];
}

function registerShortCuts(): void {
  if (isDevelopment) {
    globalShortcut.register("CommandOrControl+R", () => {
      mainWindow && mainWindow.reload();
    });
  }
}

function createMainWindow() {
  const window = new BrowserWindow();

  menu = Menu.buildFromTemplate(getMenuTemplate());
  Menu.setApplicationMenu(menu);

  if (isDevelopment) {
    window.webContents.openDevTools();
  }
  registerShortCuts();

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

  window.on("closed", () => {
    mainWindow = null;
    menu = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
  mainWindow = createMainWindow();
});
