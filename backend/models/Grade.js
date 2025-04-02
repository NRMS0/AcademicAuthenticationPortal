const mongoose = require('mongoose');

//Grade Schema
const gradeSchema = new mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true }, 
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true }, 
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    grade: { type: Number, required: true, min: 0, max: 100 }, 
    feedback: { type: String }, 
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);