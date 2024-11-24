$(document).ready(function () {
  let currentUser;

  // Fetch current user and appointments
  function fetchCurrentUserAndAppointments() {
    $.ajax({
      url: '/current-user',
      method: 'GET',
      success: function (data) {
        currentUser = data;
        fetchAppointments(); // Fetch appointments after user is identified
      },
      error: function () {
        console.error('Failed to fetch current user.');
        window.location.href = '/login'; // Redirect to login if not authenticated
      }
    });
  }

  // Fetch appointments based on user role
  function fetchAppointments() {
    console.log('Fetching appointments for role:', currentUser.role, currentUser); // Debugging role

    $.ajax({
      url: '/api/appointments',
      method: 'GET',
      success: function (response) {
        if (currentUser.role === 'User') {
          renderUserAppointments(response);
        } else if (currentUser.role === 'MedicalProvider') {
          renderProviderAppointments(response);
          console.log(response);
        } else {
          console.error('Unknown role:', currentUser.role);
        }
      },
      error: function (err) {
        console.error('Failed to fetch appointments:', err);
        $('#appointments-container').empty().append('<p>Failed to load appointments.</p>');
      }
    });
  }


  // Render appointments for Users
  function renderUserAppointments(appointments) {
    $('#appointments-container').empty();
    if (appointments.length === 0) {
      $('#appointments-container').append('<p>No appointments booked.</p>');
      return;
    }
    appointments.forEach(appointment => {
      const appointmentCard =
        `
       <div class="col service-card" data-name="${appointment.serviceId.name}">
          <div class="card h-100">
            <img src="${appointment.serviceId.photo || '../public/img/default-service.jpg'}" class="card-img-top" alt="${appointment.serviceId.photo}">
           <div class="card-body">
            <h5 class="card-title">${appointment.serviceId.name}</h5>
            <p class="card-text"><strong>Description:</strong> ${appointment.serviceId.description}</p>
            <p class="card-text"><strong>Location:</strong> ${appointment.serviceId.location}</p>
            <p class="card-text"><strong>Cost:</strong> $${appointment.serviceId.cost}</p>
            <p class="card-text"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
          </div>
         
          </div>
        </div>`;
      $('#appointments-container').append(appointmentCard);
    });
  }


  // Render appointments for Medical Providers
  function renderProviderAppointments(appointments) {
    $('#appointments-container').empty();
    if (appointments.length === 0) {
      $('#appointments-container').append('<p>No pending appointments.</p>');
      return;
    }
    appointments.forEach(appointment => {
      const appointmentCard = `
       <div class="col service-card" data-name="${appointment.serviceId.name}">
          <div class="card h-100">
            <div class="card-body">
            <h5 class="card-title">${appointment.serviceId.name}</h5>
         <p class="card-text"><strong>Description:</strong> ${appointment.serviceId.description}</p>
          <p class="card-text"><strong>Location:</strong> ${appointment.serviceId.location}</p>
          <p class="card-text"><strong>Cost:</strong> $${appointment.serviceId.cost}</p>
          <p class="card-text"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
          <p class="card-text"><strong>Booked by:</strong> ${appointment.userId.name}</p>
          <p class="card-text"><strong>Contact:</strong> ${appointment.userId.phone}</p>
            

            </div >
         
          </div >
        </div > `;
      $('#appointments-container').append(appointmentCard);
    });
  }

  // Initial fetch
  fetchCurrentUserAndAppointments();
});
