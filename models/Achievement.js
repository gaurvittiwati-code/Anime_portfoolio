const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  badgeId: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    default: 'Common' // Common, Rare, Epic, Legendary
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
