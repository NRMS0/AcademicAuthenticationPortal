const mongoose = require('mongoose');

//Course Schema
const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    // Public display
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: { type: String },
    learningObjectives: [{ type: String }],
    prerequisites: [{ type: String }],
    isPublic: { type: Boolean, default: true } 
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);