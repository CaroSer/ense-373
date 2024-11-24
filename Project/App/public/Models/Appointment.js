
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProvider', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  appointmentDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

