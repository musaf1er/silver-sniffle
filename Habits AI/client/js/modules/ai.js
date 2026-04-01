// client/js/modules/ai.js
export class AIModule {
  async getSuggestions(tasks, habits) {
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, habits })
      });
      const data = await response.json();
      return data.success ? data.data : this.generateMockSuggestions(tasks, habits);
    } catch {
      return this.generateMockSuggestions(tasks, habits);
    }
  }

  generateMockSuggestions(tasks, habits) {
    const suggestions = [];
    const pendingTasks = tasks.filter(t => !t.completed);
    
    if (pendingTasks.length > 5) {
      suggestions.push("📊 You have too many pending tasks. Focus on your top 3 priorities today.");
    }
    
    const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && !t.completed);
    if (overdueTasks.length > 0) {
      suggestions.push(`⚠️ ${overdueTasks.length} task(s) are overdue. Consider rescheduling or breaking them down.`);
    }
    
    const longTasks = pendingTasks.filter(t => t.title && t.title.length > 30);
    if (longTasks.length > 0) {
      suggestions.push("🔨 Break large tasks into smaller, actionable subtasks for better progress.");
    }
    
    const completedHabits = habits.filter(h => h.checked).length;
    if (completedHabits === 0 && habits.length > 0) {
      suggestions.push("🌱 Start your day by completing at least one habit to build momentum!");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("✨ Great job! Stay consistent and keep crushing your goals.");
    }
    
    return suggestions;
  }
}