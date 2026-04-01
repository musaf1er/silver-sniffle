// server/controllers/dashboardController.js
const aiService = require('../services/aiService');

exports.getAISuggestions = async (req, res) => {
  try {
    const { tasks, habits } = req.body;
    const suggestions = aiService.generateSuggestions(tasks, habits);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};