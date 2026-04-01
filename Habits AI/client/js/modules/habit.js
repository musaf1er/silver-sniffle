// client/js/modules/habit.js
import { storage } from '../utils/storage.js';

export class HabitModule {
  constructor() {
    this.habits = storage.get('habits', []);
    this.initHabits();
  }

  initHabits() {
    const today = new Date().toDateString();
    this.habits = this.habits.map(habit => {
      if (habit.lastUpdated !== today) {
        habit.checked = false;
      }
      return habit;
    });
    storage.set('habits', this.habits);
  }

  addHabit(name) {
    const newHabit = {
      id: Date.now().toString(),
      name,
      streak: 0,
      checked: false,
      lastUpdated: new Date().toDateString()
    };
    this.habits.push(newHabit);
    storage.set('habits', this.habits);
    return newHabit;
  }

  toggleHabit(id) {
    const habit = this.habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = new Date().toDateString();
    if (habit.lastUpdated !== today) {
      habit.checked = true;
      habit.streak += 1;
      habit.lastUpdated = today;
    } else {
      if (habit.checked) {
        habit.checked = false;
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        habit.checked = true;
        habit.streak += 1;
      }
    }
    storage.set('habits', this.habits);
  }

  getStats() {
    const totalStreak = this.habits.reduce((sum, h) => sum + h.streak, 0);
    const completedToday = this.habits.filter(h => h.checked).length;
    const progress = this.habits.length ? (completedToday / this.habits.length) * 100 : 0;
    return { totalStreak, progress };
  }
}