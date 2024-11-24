const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('./passport-config');
const app = express();
const PORT = process.env.PORT || 3000;
const Account = require('./public/Models/Account');
const User = require('./public/Models/User');
const MedicalProvider = require('./public/Models/MedicalProvider');
const Service = require('./public/Models/Service');
const Appointment = require('./public/Models/Appointment');


mongoose.connect('mongodb://localhost:27017/medilocate');

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure express-session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/services-catalog');
}

// Middleware to check role
function isRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) return next();
    res.status(403).send('Unauthorized');
  };
}

// Home page
app.get('/', (req, res) => {
  console.log('Rendering home page');
  res.render('login', { error: res.locals.error });
});



// Login Route
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  successRedirect: '/services-catalog', // Default redirect
}));

// Logout Route
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Signup Routes (User and MedicalProvider)

app.get('/signup-user', (req, res) => {
  res.render('signup-user');
});

app.post('/signup-user', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const account = await Account.create({ email, password, role: 'User' });
    await User.create({ accountId: account._id, name, phone });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

app.get('/signup-medical', (req, res) => {
  res.render('signup-medical');
});

app.post('/signup-medical', async (req, res) => {
  try {
    const { email, password, name, location } = req.body;
    const account = await Account.create({ email, password, role: 'MedicalProvider' });
    await MedicalProvider.create({ accountId: account._id, name, location });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating medical provider');
  }
});
// Services Catalog (Accessible to both roles)
app.get('/services-catalog', isAuthenticated, async (req, res) => {
  try {
    const services = await Service.find().populate('medicalProviderId', 'name location');
    res.render('services-catalog', { services, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching services');
  }
});

// Appointments Page
app.get('/appointments', isAuthenticated, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'User') {
      appointments = await Appointment.find({ userId: req.user._id })
        .populate('serviceId')
        .populate('medicalProviderId');
    } else if (req.user.role === 'MedicalProvider') {
      appointments = await Appointment.find({ medicalProviderId: req.user._id })
        .populate('serviceId')
        .populate('userId');
    }
    res.render('Appointments', { appointments, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching appointments');
  }
});

// Profile Page
app.get('/profile', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role === 'User') {
      const profile = await User.findOne({ accountId: req.user._id });
      res.render('Profile', { profile, user: req.user });
    } else if (req.user.role === 'MedicalProvider') {
      const profile = await MedicalProvider.findOne({ accountId: req.user._id });
      res.render('Profile', { profile, user: req.user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching profile');
  }
});

// Services Offered (Medical Providers Only)
app.get('/services-offered', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const services = await Service.find({ medicalProviderId: req.user._id });
    res.render('services-offered', { services, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching services');
  }
});
app.post('/api/services', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const { name, description, cost, photo } = req.body;
    const provider = await MedicalProvider.findOne({ accountId: req.user._id });
    const service = await Service.create({
      name,
      description,
      cost,
      location: provider.location,
      photo,
      medicalProviderId: provider._id,
    });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating service');
  }
});
app.post('/api/appointments', isAuthenticated, isRole('User'), async (req, res) => {
  try {
    const { serviceId, appointmentDate } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).send('Service not found');

    const appointment = await Appointment.create({
      userId: req.user._id,
      medicalProviderId: service.medicalProviderId,
      serviceId,
      appointmentDate,
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating appointment');
  }
});
app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).send('Appointment not found');

    // Ensure only the relevant user or provider can cancel
    if (
      (req.user.role === 'User' && appointment.userId.toString() !== req.user._id.toString()) ||
      (req.user.role === 'MedicalProvider' && appointment.medicalProviderId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).send('Unauthorized');
    }

    await Appointment.findByIdAndDelete(id);
    res.status(200).send('Appointment cancelled');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error cancelling appointment');
  }
});
app.delete('/api/services/:id', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).send('Service not found');

    if (service.medicalProviderId.toString() !== req.user._id.toString()) {
      return res.status(403).send('Unauthorized');
    }

    await Service.findByIdAndDelete(id);
    res.status(200).send('Service deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting service');
  }
});
app.put('/api/profile', isAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    if (req.user.role === 'User') {
      await User.findOneAndUpdate({ accountId: req.user._id }, updates);
    } else if (req.user.role === 'MedicalProvider') {
      await MedicalProvider.findOneAndUpdate({ accountId: req.user._id }, updates);
    }
    res.status(200).send('Profile updated');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating profile');
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});