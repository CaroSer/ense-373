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

    // Create Accounts
    const accounts = await Account.insertMany([
      { email: 'user1@example.com', password: 'password1', role: 'User' },
      { email: 'user2@example.com', password: 'password2', role: 'User' },
      { email: 'provider1@example.com', password: 'password3', role: 'MedicalProvider' },
      { email: 'provider2@example.com', password: 'password4', role: 'MedicalProvider' },
      { email: 'provider3@example.com', password: 'password5', role: 'MedicalProvider' },
    ]);

    // Create Users
    const users = await User.insertMany([
      { accountId: accounts[0]._id, name: 'John Doe', phone: '1234567890', appointments: [] },
      { accountId: accounts[1]._id, name: 'Jane Smith', phone: '0987654321', appointments: [] },
    ]);

    // Create MedicalProviders
    const providers = await MedicalProvider.insertMany([
      { accountId: accounts[2]._id, name: 'Dr. Alice', location: 'Clinic A', services: [], pendingAppointments: [] },
      { accountId: accounts[3]._id, name: 'Dr. Bob', location: 'Clinic B', services: [], pendingAppointments: [] },
      { accountId: accounts[4]._id, name: 'Dr. Charlie', location: 'Clinic C', services: [], pendingAppointments: [] },
    ]);

    // Create Services
    const services = await Service.insertMany([
      { name: 'General Checkup', description: 'Basic health checkup', cost: 50, location: providers[0].location, photo: '/public/img/service1.jpg', medicalProviderId: providers[0]._id },
      { name: 'Pediatric Consultation', description: 'Consultation for children', cost: 75, location: providers[1].location, photo: '/public/img/service2.jpg', medicalProviderId: providers[1]._id },
      { name: 'Dermatology Consultation', description: 'Skin and hair treatment', cost: 100, location: providers[2].location, photo: '/public/img/service3.jpg', medicalProviderId: providers[2]._id },
      { name: 'Cardiology Consultation', description: 'Heart health consultation', cost: 150, location: providers[0].location, photo: '/public/img/service1.jpg', medicalProviderId: providers[0]._id },
      { name: 'Orthopedic Consultation', description: 'Bone and joint care', cost: 200, location: providers[1].location, photo: '/public/img/service2.jpg', medicalProviderId: providers[1]._id },
    ]);

    // Assign services to providers
    providers[0].services.push(services[0]._id, services[3]._id);
    providers[1].services.push(services[1]._id, services[4]._id);
    providers[2].services.push(services[2]._id);

    await Promise.all(providers.map(provider => provider.save()));

    // Create Appointments
    const appointments = await Appointment.insertMany([
      { userId: users[0]._id, medicalProviderId: providers[0]._id, serviceId: services[0]._id, appointmentDate: new Date('2024-12-01'), status: 'Pending' },
      { userId: users[0]._id, medicalProviderId: providers[1]._id, serviceId: services[1]._id, appointmentDate: new Date('2024-12-02'), status: 'Pending' },
      { userId: users[1]._id, medicalProviderId: providers[2]._id, serviceId: services[2]._id, appointmentDate: new Date('2024-12-03'), status: 'Completed' },
      { userId: users[1]._id, medicalProviderId: providers[0]._id, serviceId: services[3]._id, appointmentDate: new Date('2024-12-04'), status: 'Pending' },
      { userId: users[0]._id, medicalProviderId: providers[1]._id, serviceId: services[4]._id, appointmentDate: new Date('2024-12-05'), status: 'Cancelled' },
    ]);

    // Assign appointments to users and providers
    users[0].appointments.push(appointments[0]._id, appointments[1]._id, appointments[4]._id);
    users[1].appointments.push(appointments[2]._id, appointments[3]._id);

    providers[0].pendingAppointments.push(appointments[0]._id, appointments[3]._id);
    providers[1].pendingAppointments.push(appointments[1]._id, appointments[4]._id);

    await Promise.all(users.map(user => user.save()));
    await Promise.all(providers.map(provider => provider.save()));

    console.log('Data populated successfully!');
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    mongoose.connection.close();
  }
};

populateData();
