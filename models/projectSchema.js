const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Planned", "In Progress", "Completed"],
    default: "Planned"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
