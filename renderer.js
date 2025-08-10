class TodoManager {
  constructor() {
    this.todos = [];
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    this.bindEvents();
    this.setupMenuListeners();
    await this.loadTodos();
    this.render();
  }

  // 事件綁定
  bindEvents() {
    // 表單提交
    document.getElementById('todoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });

    // 篩選器
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // 清除已完成
    document.getElementById('clearCompleted').addEventListener('click', () => {
      this.clearCompleted();
    });

    // 全選/取消全選
    document.getElementById('selectAll').addEventListener('click', () => {
      this.toggleAll();
    });

    // Enter 鍵快捷鍵
    document.getElementById('todoInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });
  }

  // 設置菜單監聽器
  setupMenuListeners() {
    window.electronAPI.onMenuNewTodo(() => {
      document.getElementById('todoInput').focus();
    });

    window.electronAPI.onMenuClearCompleted(() => {
      this.clearCompleted();
    });
  }

  // 載入待辦事項
  async loadTodos() {
    try {
      this.todos = await window.electronAPI.loadTodos();
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todos = [];
    }
  }

  // 保存待辦事項
  async saveTodos() {
    try {
      await window.electronAPI.saveTodos(this.todos);
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }

  // 添加新待辦事項
  addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    input.value = '';
    this.saveTodos();
    this.render();
  }

  // 刪除待辦事項
  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    if (todoElement) {
      todoElement.classList.add('removing');
      setTimeout(() => {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
      }, 300);
    }
  }

  // 切換完成狀態
  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  // 編輯待辦事項
  editTodo(id, newText) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo && newText.trim()) {
      todo.text = newText.trim();
      this.saveTodos();
      this.render();
    }
  }

  // 設置篩選器
  setFilter(filter) {
    this.currentFilter = filter;
    
    // 更新按鈕狀態
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.render();
  }

  // 獲取篩選後的待辦事項
  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  }

  // 清除已完成的待辦事項
  clearCompleted() {
    const hasCompleted = this.todos.some(todo => todo.completed);
    if (hasCompleted) {
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveTodos();
      this.render();
    }
  }

  // 全選/取消全選
  toggleAll() {
    const allCompleted = this.todos.length > 0 && this.todos.every(todo => todo.completed);
    
    this.todos.forEach(todo => {
      todo.completed = !allCompleted;
    });

    this.saveTodos();
    this.render();
  }

  // 創建待辦事項 HTML
  createTodoHTML(todo) {
    return `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <input 
          type="checkbox" 
          class="todo-checkbox" 
          ${todo.completed ? 'checked' : ''}
          onchange="todoManager.toggleTodo(${todo.id})"
        >
        <span class="todo-text" ondblclick="todoManager.startEdit(${todo.id})">
          ${this.escapeHtml(todo.text)}
        </span>
        <div class="todo-actions">
          <button class="edit-btn" onclick="todoManager.startEdit(${todo.id})">Edit</button>
          <button class="delete-btn" onclick="todoManager.deleteTodo(${todo.id})">Delete</button>
        </div>
      </li>
    `;
  }

  // 開始編輯模式
  startEdit(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) return;

    const todoElement = document.querySelector(`[data-id="${id}"]`);
    const textElement = todoElement.querySelector('.todo-text');
    const actionsElement = todoElement.querySelector('.todo-actions');

    // 創建編輯輸入框
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.text;
    
    // 創建保存按鈕
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'edit-btn';
    
    // 創建取消按鈕
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'delete-btn';

    // 事件處理
    const saveEdit = () => {
      const newText = editInput.value.trim();
      if (newText) {
        this.editTodo(id, newText);
      } else {
        this.render(); // 取消編輯
      }
    };

    const cancelEdit = () => {
      this.render(); // 重新渲染取消編輯
    };

    saveBtn.onclick = saveEdit;
    cancelBtn.onclick = cancelEdit;
    
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });

    // 替換元素
    textElement.replaceWith(editInput);
    actionsElement.innerHTML = '';
    actionsElement.appendChild(saveBtn);
    actionsElement.appendChild(cancelBtn);

    // 聚焦並選中文本
    editInput.focus();
    editInput.select();
  }

  // 轉義 HTML 特殊字符
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 更新統計信息
  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;

    document.getElementById('totalTasks').textContent = 
      `${total} task${total !== 1 ? 's' : ''}`;
    document.getElementById('completedTasks').textContent = 
      `${completed} completed`;
  }

  // 渲染待辦事項列表
  render() {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    const filteredTodos = this.getFilteredTodos();

    // 更新統計
    this.updateStats();

    // 清空現有列表
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
      emptyState.style.display = 'block';
      
      // 根據當前篩選器顯示不同的空狀態訊息
      const messages = {
        all: '🎉 No tasks yet! Add one above to get started.',
        active: '✨ All tasks completed! Great job!',
        completed: '📝 No completed tasks yet.'
      };
      
      emptyState.querySelector('p').textContent = messages[this.currentFilter];
    } else {
      emptyState.style.display = 'none';
      
      // 渲染待辦事項
      filteredTodos.forEach(todo => {
        todoList.innerHTML += this.createTodoHTML(todo);
      });
    }

    // 更新按鈕狀態
    document.getElementById('clearCompleted').style.display = 
      this.todos.some(todo => todo.completed) ? 'block' : 'none';
      
    document.getElementById('selectAll').textContent = 
      this.todos.length > 0 && this.todos.every(todo => todo.completed) ? 
      'Uncheck All' : 'Check All';
  }
}

// 初始化應用
let todoManager;

document.addEventListener('DOMContentLoaded', () => {
  todoManager = new TodoManager();
});
