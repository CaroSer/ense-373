const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  location: { type: String, required: true }, // Derived from MedicalProvider's location
  photo: { type: String }, // URL or path to service photo
  medicalProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProvider', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
