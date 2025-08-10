const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// 開發模式配置
const isDev = process.env.NODE_ENV === 'development';

class TodoApp {
  constructor() {
    this.window = null;
    this.dataPath = path.join(__dirname, 'data', 'todos.json');
  }

  async createWindow() {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
      show: false
    });

    await this.window.loadFile('index.html');
    
    // 窗口就緒後顯示
    this.window.once('ready-to-show', () => {
      this.window.show();
      if (isDev) {
        this.window.webContents.openDevTools();
      }
    });

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  createMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Todo',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.window.webContents.send('menu-new-todo');
            }
          },
          {
            label: 'Clear Completed',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
              this.window.webContents.send('menu-clear-completed');
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  async setupDataDirectory() {
    const dataDir = path.dirname(this.dataPath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async loadTodos() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // 文件不存在時返回空陣列
      return [];
    }
  }

  async saveTodos(todos) {
    await fs.writeFile(this.dataPath, JSON.stringify(todos, null, 2));
  }

  setupIpcHandlers() {
    // 加載待辦事項
    ipcMain.handle('load-todos', async () => {
      return await this.loadTodos();
    });

    // 保存待辦事項
    ipcMain.handle('save-todos', async (event, todos) => {
      await this.saveTodos(todos);
      return true;
    });
  }

  async initialize() {
    await this.setupDataDirectory();
    this.setupIpcHandlers();
    await this.createWindow();
    this.createMenu();
  }
}

// 應用程式生命週期管理
const todoApp = new TodoApp();

app.whenReady().then(() => {
  todoApp.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    todoApp.createWindow();
  }
});
