const mongoose = require('mongoose');

//Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
});

// Automatically populate the `course` field 
assignmentSchema.pre('find', function () {
  this.populate('course');
});

assignmentSchema.pre('findOne', function () {
  this.populate('course');
});

module.exports = mongoose.model('Assignment', assignmentSchema);