// client/js/modules/todo.js
import { storage } from '../utils/storage.js';

export class TodoModule {
  constructor() {
    this.tasks = storage.get('tasks', []);
    this.currentFilter = 'all';
    this.dragSource = null;
  }

  async fetchTasks() {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        this.tasks = data.data;
        storage.set('tasks', this.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks from server');
    }
    return this.tasks;
  }

  async addTask(title, deadline) {
    const newTask = {
      id: Date.now().toString(),
      title,
      deadline: deadline || null,
      completed: false,
      order: this.tasks.length
    };
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await response.json();
      if (data.success) {
        this.tasks.push(data.data);
        storage.set('tasks', this.tasks);
        return data.data;
      }
    } catch {
      this.tasks.push(newTask);
      storage.set('tasks', this.tasks);
      return newTask;
    }
  }

  async updateTask(id, updates) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) this.tasks[index] = { ...this.tasks[index], ...updates };
        storage.set('tasks', this.tasks);
      }
    } catch {
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) this.tasks[index] = { ...this.tasks[index], ...updates };
      storage.set('tasks', this.tasks);
    }
  }

  async deleteTask(id) {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      this.tasks = this.tasks.filter(t => t.id !== id);
      storage.set('tasks', this.tasks);
    } catch {
      this.tasks = this.tasks.filter(t => t.id !== id);
      storage.set('tasks', this.tasks);
    }
  }

  async reorderTasks(sourceIndex, targetIndex) {
    const reordered = [...this.tasks];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    this.tasks = reordered;
    storage.set('tasks', this.tasks);
  }

  getFilteredTasks() {
    if (this.currentFilter === 'completed') return this.tasks.filter(t => t.completed);
    if (this.currentFilter === 'pending') return this.tasks.filter(t => !t.completed);
    return this.tasks;
  }
}