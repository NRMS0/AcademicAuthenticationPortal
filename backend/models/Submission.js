const mongoose = require('mongoose');

//Submission Schema
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{
    url: { type: String, required: true },
    filename: { type: String, required: true }
  }],
  submittedAt: { type: Date, default: Date.now },
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
});

// Virtual to populate grades
submissionSchema.virtual('gradeDetails', {
  ref: 'Grade',
  localField: '_id', 
  foreignField: 'submission', 
  justOne: true
});

// Ensure virtuals are converted to JSON or plain object
submissionSchema.set('toObject', { virtuals: true });
submissionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Submission', submissionSchema);
