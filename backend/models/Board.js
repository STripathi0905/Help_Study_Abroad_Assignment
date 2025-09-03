const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  columns: [{
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    taskIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }],
  }],
  columnOrder: [{
    type: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

BoardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Board', BoardSchema);