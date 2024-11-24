const mongoose = require('mongoose');

const medicalProviderSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true }, // Location registered during signup
  phone: { type: String, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // List of services they offer
  pendingAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // Pending appointments
}, { timestamps: true });

medicalProviderSchema.post('save', function (doc) {
  console.log(`MedicalProvider ${doc._id} updated with services:`, doc.services);
});


module.exports = mongoose.model('MedicalProvider', medicalProviderSchema);
