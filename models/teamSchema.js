const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Store unlimited members
  members: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Team', teamSchema);
