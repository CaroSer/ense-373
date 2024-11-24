const mongoose = require('mongoose');

const medicalProviderSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true }, // Location registered during signup
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // List of services they offer
  pendingAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // Pending appointments
}, { timestamps: true });

module.exports = mongoose.model('MedicalProvider', medicalProviderSchema);
