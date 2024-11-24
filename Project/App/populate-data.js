const mongoose = require('mongoose');
const Account = require('./public/Models/Account');
const User = require('./public/Models/User');
const MedicalProvider = require('./public/Models/MedicalProvider');
const Service = require('./public/Models/Service');
const Appointment = require('./public/Models/Appointment');

mongoose.connect('mongodb://localhost:27017/medilocate');

const populateData = async () => {
  try {
    // Clear existing data
    await Account.deleteMany({});
    await User.deleteMany({});
    await MedicalProvider.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});


    console.log('Data populated successfully!');
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    mongoose.connection.close();
  }
};

populateData();
