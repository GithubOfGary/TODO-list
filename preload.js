const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API 給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 待辦事項數據操作
  loadTodos: () => ipcRenderer.invoke('load-todos'),
  saveTodos: (todos) => ipcRenderer.invoke('save-todos', todos),

  // 監聽菜單事件
  onMenuNewTodo: (callback) => {
    ipcRenderer.on('menu-new-todo', callback);
  },
  onMenuClearCompleted: (callback) => {
    ipcRenderer.on('menu-clear-completed', callback);
  },

  // 清理監聽器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
