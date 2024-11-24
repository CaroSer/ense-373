const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // History of appointments
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
