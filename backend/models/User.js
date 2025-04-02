const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer'], required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // 2FA fields
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
});

// Auto-hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
