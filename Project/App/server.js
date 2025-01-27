const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('./database/passport-config');
const app = express();
const PORT = process.env.PORT || 3000;
const Account = require('./public/Models/Account');
const User = require('./public/Models/User');
const MedicalProvider = require('./public/Models/MedicalProvider');
const Service = require('./public/Models/Service');
const Appointment = require('./public/Models/Appointment');
const multer = require('multer');
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Ensure intermediate directories are created
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the absolute path for the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage })


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
app.use('/uploads', express.static(uploadsDir));


// Routes
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
}


// Middleware to check role
function isRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) return next();
    res.status(403).send('Unauthorized');
  };
}


//ROUTES 

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

// Signup medical
app.get('/signup-medical', (req, res) => {
  res.render('signup-medical');
});

// Signup user
app.get('/signup-user', (req, res) => {
  res.render('signup-user');
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

//Services offered by a medical provider
app.get('/services-offered', isAuthenticated, async (req, res) => {
  try {
    const services = await Service.find({ medicalProviderId: req.user._id });
    res.render('services-offered', { services, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching services');
  }
});

//appointments made by a user or pending appointments for a medical provider
app.get('/appointments', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role === 'User') {
      const appointments = await Appointment.find({ userId: req.user._id }).populate('serviceId');
      res.render('appointments', { appointments, user: req.user });
    } else if (req.user.role === 'MedicalProvider') {
      const appointments = await Appointment.find({ medicalProviderId: req.user._id, status: 'Pending' }).populate('serviceId');
      res.render('appointments', { appointments, user: req.user });
    }
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

// Logout Route
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});



//APIS


//SINGUP
//Singup user 
app.post('/signup-user', async (req, res) => {
  try {
    const { email, password, name, phone, location } = req.body;
    const account = await Account.create({ email, password, role: 'User' });
    const user = await User.create({ accountId: account._id, name, location, phone });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

//Signup medical provider
app.post('/signup-medical', async (req, res) => {
  try {
    const { email, password, name, location, phone } = req.body;
    const account = await Account.create({ email, password, role: 'MedicalProvider' });
    await MedicalProvider.create({ accountId: account._id, name, location, phone });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating medical provider');
  }
});


//PROFILE
// Get Profile
app.get('/api/get-profile', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role === 'User') {
      const profile = await User.findOne({ accountId: req.user._id });
      res.json(profile);
    } else if (req.user.role === 'MedicalProvider') {
      const profile = await MedicalProvider.findOne({ accountId: req.user._id });
      res.json(profile);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching profile');
  }
});

// Update Profile
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


//SERVICES
app.get('/current-user', isAuthenticated, (req, res) => {
  res.json(req.user); // Assuming `req.user` contains user details from session
});

//SERVICES OFFERED
// Get services offered by a medical provider
app.get('/api/services', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const provider = await MedicalProvider.findOne({ accountId: req.user._id }).populate('services');
    if (!provider) {
      return res.status(404).json({ error: 'Medical Provider not found.' });
    }

    console.log('Services offered:', provider.services); // Debugging
    res.json(provider.services); // Send populated services
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});


// Create a new service
app.post('/api/services', upload.single('photo'), isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const { name, description, cost } = req.body;
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send('Photo is required.');
    }

    const provider = await MedicalProvider.findOne({ accountId: req.user._id });
    if (!provider) {
      return res.status(404).send('Medical Provider not found.');
    }

    const photo = `/uploads/${req.file.filename}`;
    const newService = await Service.create({
      name,
      description,
      cost,
      location: provider.location,
      photo,
      medicalProviderId: provider._id,
    });

    provider.services.push(newService._id);
    await provider.save();

    const updatedProvider = await MedicalProvider.findOne({ accountId: req.user._id }).populate('services');
    res.status(201).json(updatedProvider.services);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).send('Failed to create service.');
  }
});


// Delete a service
app.delete('/api/services/:id', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Fetch the service to verify ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }


    // Remove the service from the MedicalProvider's services array
    await MedicalProvider.findByIdAndUpdate(service.medicalProviderId, {
      $pull: { services: serviceId },
    });

    // Delete the service
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

// Update a service
app.put('/api/services/:id', isAuthenticated, isRole('MedicalProvider'), async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, description, cost, location } = req.body;
    console.error(req.body);

    // Check for missing fields
    if (!name || !description || !cost || !location) {
      return res.status(400).json({ error: 'All fields (name, description, cost, location) are required.' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    service.name = name;
    service.description = description;
    service.cost = cost;
    service.location = location;

    await service.save();

    res.status(200).json({ message: 'Service updated successfully.' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});



// SERVICES CATALOG
// Get all services
app.get('/api/services/catalog', isAuthenticated, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
    console.log('Fetched services:', services);

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

//book service
app.post('/api/appointments', isAuthenticated, isRole('User'), async (req, res) => {
  try {
    const { serviceId, appointmentDate } = req.body;

    const user = await User.findOne({ accountId: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found for the given account.' });
    }
    const provider = await MedicalProvider.findOne({ services: serviceId });

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }


    const appointment = await Appointment.create({
      userId: user._id,
      medicalProviderId: provider._id,
      serviceId,
      appointmentDate,
      status: 'Pending',
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).send('Failed to book appointment.');
  }
});


//APPOINTMENTS
// Get appointments based on user role
app.get('/api/appointments', isAuthenticated, async (req, res) => {
  try {
    console.log('Role:', req.user.role); // Debugging the role

    if (req.user.role === 'User') {
      // Fetch appointments booked by the user
      console.log('Fetching appointments for user:', req.user._id);
      const user = await User.findOne({ accountId: req.user._id });
      const appointments = await Appointment.find({ userId: user._id })
        .populate('serviceId', 'name description location cost medicalProviderId')
        .populate('medicalProviderId', 'name location');
      console.log(appointments)

      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ error: 'No appointments found for this user.' });
      }

      console.log('User appointments:', appointments);
      return res.json(appointments);
    } else if (req.user.role === 'MedicalProvider') {

      // Fetch pending appointments for the medical provider
      const provider = await MedicalProvider.findOne({ accountId: req.user._id });
      if (!provider) {
        return res.status(404).json({ error: 'Medical Provider not found.' });
      }


      const appointments = await Appointment.find({ medicalProviderId: provider._id, status: 'Pending' })
        .populate('serviceId', 'name description location cost medicalProviderId')
        .populate('userId', 'name phone location accountId');
      console.log('Populated appointments:', appointments);

      if (!appointments) {
        return res.status(404).json({ error: 'No pending appointments found for this provider.' });
      }

      console.log('Pending appointments for provider:', appointments);
      res.json(appointments);
    } else {
      return res.status(403).json({ error: 'Invalid user role.' });
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// Cancel an appointment
app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }


    // Delete or update the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment.' });
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