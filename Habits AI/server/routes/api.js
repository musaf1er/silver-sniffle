// server/routes/api.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

let tasks = [];

router.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

router.post('/tasks', (req, res) => {
  const task = req.body;
  tasks.push(task);
  res.json({ success: true, data: task });
});

router.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    res.json({ success: true, data: tasks[index] });
  } else {
    res.status(404).json({ success: false, error: 'Task not found' });
  }
});

router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.json({ success: true });
});

router.post('/ai/suggest', dashboardController.getAISuggestions);

module.exports = router;