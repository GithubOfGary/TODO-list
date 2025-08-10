# TODO List - Electron App

一個使用 Electron 構建的現代化待辦事項管理應用程式。

## 功能特色

- ✅ **現代化 UI 設計** - 清晰直觀的用戶界面
- 🎯 **完整功能** - 新增、編輯、刪除、標記完成
- 🔍 **智能篩選** - 顯示全部、進行中、已完成的任務
- 💾 **數據持久化** - 自動保存到本地文件
- ⌨️ **快捷鍵支持** - 提高使用效率
- 📱 **響應式設計** - 適配不同窗口大小
- 🎨 **平滑動畫** - 優雅的過渡效果

## 技術架構

### 主進程 (main.js)
- 使用類模式組織代碼，提高可讀性和維護性
- 安全的 IPC 通信處理
- 自動創建數據目錄
- 應用程式菜單集成

### 預載腳本 (preload.js)
- Context Bridge 安全 API 暴露
- 主進程與渲染進程的安全通信橋樑

### 渲染進程 (renderer.js)
- 模組化的 TodoManager 類
- 事件驅動的架構設計
- 優化的 DOM 操作
- 完整的錯誤處理

## 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 生產模式
```bash
npm start
```

### 構建應用
```bash
npm run build
```

## 使用說明

### 基本操作
1. **新增任務** - 在輸入框中輸入任務內容，按 Enter 或點擊 "Add Task"
2. **標記完成** - 點擊任務前的勾選框
3. **編輯任務** - 雙擊任務文本或點擊 "Edit" 按鈕
4. **刪除任務** - 點擊 "Delete" 按鈕

### 快捷鍵
- `Ctrl/Cmd + N` - 新增任務（聚焦輸入框）
- `Ctrl/Cmd + Shift + C` - 清除已完成任務
- `Enter` - 確認編輯
- `Escape` - 取消編輯

### 篩選功能
- **All** - 顯示所有任務
- **Active** - 只顯示未完成的任務
- **Completed** - 只顯示已完成的任務

## 代碼特色

### 高效且易讀的設計
```javascript
// 使用類模式組織功能
class TodoManager {
  constructor() {
    this.todos = [];
    this.currentFilter = 'all';
    this.init();
  }
  
  // 清晰的方法命名
  async addTodo() { /* ... */ }
  toggleTodo(id) { /* ... */ }
  deleteTodo(id) { /* ... */ }
}
```

### 安全的 IPC 通信
```javascript
// Context Bridge 安全 API
contextBridge.exposeInMainWorld('electronAPI', {
  loadTodos: () => ipcRenderer.invoke('load-todos'),
  saveTodos: (todos) => ipcRenderer.invoke('save-todos', todos)
});
```


## 數據存儲

應用程式會在應用目錄下創建 `data/todos.json` 文件來保存所有待辦事項：

```json
[
  {
    "id": 1641234567890,
    "text": "完成 Electron 應用開發",
    "completed": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

## 項目結構

```
todo-electron/
├── main.js          # 主進程入口
├── preload.js       # 預載腳本
├── renderer.js      # 渲染進程邏輯
├── index.html       # 應用界面
├── styles.css       # 樣式文件
├── package.json     # 項目配置
├── assets/          # 靜態資源
└── data/            # 數據存儲目錄
    └── todos.json   # 待辦事項數據
```

## 開發建議

1. **代碼風格** - 使用 ES6+ 語法，保持代碼簡潔
2. **錯誤處理** - 完整的 try-catch 處理
3. **用戶體驗** - 平滑的動畫和反饋
4. **安全性** - Context Isolation 和安全的 IPC 通信

## 擴展功能建議

- [ ] 任務優先級設置
- [ ] 任務分類標籤
- [ ] 搜索功能
- [ ] 數據導出/導入
- [ ] 暗黑模式
- [ ] 通知提醒
- [ ] 任務統計圖表

## 備註
claude code 生成

