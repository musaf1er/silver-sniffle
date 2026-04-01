// client/js/app.js
import { TodoModule } from './modules/todo.js';
import { HabitModule } from './modules/habit.js';
import { TimerModule } from './modules/timer.js';
import { AIModule } from './modules/ai.js';

class App {
  constructor() {
    this.todo = new TodoModule();
    this.habit = new HabitModule();
    this.timer = new TimerModule();
    this.ai = new AIModule();
    this.currentView = 'todo';
    this.init();
  }

  async init() {
    await this.todo.fetchTasks();
    this.renderTodo();
    this.renderHabits();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.initTimer();
    this.loadAISuggestions();
  }

  renderTodo() {
    const container = document.getElementById('todo-list-container');
    const emptyState = document.getElementById('empty-todo');
    const tasks = this.todo.getFilteredTasks();
    
    if (tasks.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = tasks.map((task, idx) => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" draggable="true">
        <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
          <div class="task-title">${this.escapeHtml(task.title)}</div>
          ${task.deadline ? `<div class="task-deadline ${new Date(task.deadline) < new Date() && !task.completed ? 'overdue' : ''}">📅 ${new Date(task.deadline).toLocaleString()}</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="delete-task"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
    
    this.attachTodoEvents();
  }

  renderHabits() {
    const container = document.getElementById('habits-list');
    const emptyState = document.getElementById('empty-habits');
    const stats = this.habit.getStats();
    
    document.getElementById('totalStreak').textContent = stats.totalStreak;
    document.getElementById('habitProgressFill').style.width = `${stats.progress}%`;
    
    if (this.habit.habits.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = this.habit.habits.map(habit => `
      <div class="habit-card">
        <div class="habit-header">
          <span class="habit-name">${this.escapeHtml(habit.name)}</span>
          <span class="habit-streak">🔥 ${habit.streak} days</span>
        </div>
        <input type="checkbox" class="habit-checkbox" data-id="${habit.id}" ${habit.checked ? 'checked' : ''}>
      </div>
    `).join('');
    
    document.querySelectorAll('.habit-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.habit.toggleHabit(e.target.dataset.id);
        this.renderHabits();
        this.loadAISuggestions();
      });
    });
  }

  attachTodoEvents() {
    document.querySelectorAll('.task-check').forEach((cb, idx) => {
      cb.addEventListener('change', (e) => {
        const taskId = e.target.closest('.task-item').dataset.id;
        this.todo.updateTask(taskId, { completed: e.target.checked });
        this.renderTodo();
        this.loadAISuggestions();
      });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const taskId = e.target.closest('.task-item').dataset.id;
        await this.todo.deleteTask(taskId);
        this.renderTodo();
        this.loadAISuggestions();
      });
    });
    
    const items = document.querySelectorAll('.task-item');
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.todo.dragSource = item.dataset.id;
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', (e) => item.classList.remove('dragging'));
      item.addEventListener('dragover', (e) => e.preventDefault());
      item.addEventListener('drop', async (e) => {
        e.preventDefault();
        const targetId = item.dataset.id;
        const sourceIndex = this.todo.tasks.findIndex(t => t.id === this.todo.dragSource);
        const targetIndex = this.todo.tasks.findIndex(t => t.id === targetId);
        if (sourceIndex !== -1 && targetIndex !== -1) {
          await this.todo.reorderTasks(sourceIndex, targetIndex);
          this.renderTodo();
        }
      });
    });
  }

  initTimer() {
    const timerDisplay = () => {
      const mins = Math.floor(this.timer.timeLeft / 60);
      const secs = this.timer.timeLeft % 60;
      document.getElementById('timerMinutes').textContent = String(mins).padStart(2, '0');
      document.getElementById('timerSeconds').textContent = String(secs).padStart(2, '0');
    };
    
    this.timer.onTick = timerDisplay;
    this.timer.onComplete = () => {
      const notif = document.getElementById('timerNotification');
      notif.classList.remove('hidden');
      setTimeout(() => notif.classList.add('hidden'), 3000);
      timerDisplay();
    };
    timerDisplay();
    
    document.getElementById('startTimerBtn').onclick = () => this.timer.start();
    document.getElementById('pauseTimerBtn').onclick = () => this.timer.pause();
    document.getElementById('resetTimerBtn').onclick = () => this.timer.reset();
    document.getElementById('focusModeBtn').onclick = () => {
      this.timer.setMode('focus');
      document.getElementById('focusModeBtn').classList.add('active');
      document.getElementById('breakModeBtn').classList.remove('active');
      timerDisplay();
    };
    document.getElementById('breakModeBtn').onclick = () => {
      this.timer.setMode('break');
      document.getElementById('breakModeBtn').classList.add('active');
      document.getElementById('focusModeBtn').classList.remove('active');
      timerDisplay();
    };
  }

  async loadAISuggestions() {
    const container = document.getElementById('aiSuggestions');
    container.innerHTML = '<div class="skeleton-loader">Loading insights...</div>';
    const suggestions = await this.ai.getSuggestions(this.todo.tasks, this.habit.habits);
    container.innerHTML = suggestions.map(s => `<div class="suggestion-item">🤖 ${s}</div>`).join('');
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });
    
    document.getElementById('darkModeToggle').addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
    
    document.getElementById('newTaskBtn').addEventListener('click', () => this.openTaskModal());
    document.getElementById('addHabitBtn').addEventListener('click', () => this.openHabitModal());
    document.getElementById('refreshAiBtn').addEventListener('click', () => this.loadAISuggestions());
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.todo.currentFilter = btn.dataset.filter;
        this.renderTodo();
      });
    });
    
    const modalClose = document.querySelectorAll('.close-modal, #cancelModalBtn, #cancelHabitModalBtn');
    modalClose.forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('habitModal').style.display = 'none';
      });
    });
    
    document.getElementById('saveTaskBtn').addEventListener('click', async () => {
      const title = document.getElementById('taskInput').value;
      const deadline = document.getElementById('taskDeadline').value;
      if (title) {
        await this.todo.addTask(title, deadline);
        this.renderTodo();
        this.loadAISuggestions();
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskInput').value = '';
      }
    });
    
    document.getElementById('saveHabitBtn').addEventListener('click', () => {
      const name = document.getElementById('habitNameInput').value;
      if (name) {
        this.habit.addHabit(name);
        this.renderHabits();
        this.loadAISuggestions();
        document.getElementById('habitModal').style.display = 'none';
        document.getElementById('habitNameInput').value = '';
      }
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.openTaskModal();
      }
    });
  }
  
  openTaskModal() {
    document.getElementById('taskModal').style.display = 'flex';
    document.getElementById('taskInput').focus();
  }
  
  openHabitModal() {
    document.getElementById('habitModal').style.display = 'flex';
    document.getElementById('habitNameInput').focus();
  }
  
  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active-view'));
    document.getElementById(`${view}-view`).classList.add('active-view');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
  }
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

new App();