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
    $.ajax({
      url: '/api/appointments',
      method: 'GET',
      success: function (response) {
        if (response.role === 'User') {
          renderUserAppointments(response.appointments);
        } else if (response.role === 'MedicalProvider') {
          renderProviderAppointments(response.appointments);
        }
      },
      error: function () {
        console.error('Failed to fetch appointments.');
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
      const appointmentCard = `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${appointment.serviceId.name}</h5>
            <p class="card-text"><strong>Description:</strong> ${appointment.serviceId.description}</p>
            <p class="card-text"><strong>Location:</strong> ${appointment.serviceId.location}</p>
            <p class="card-text"><strong>Cost:</strong> $${appointment.serviceId.cost}</p>
            <p class="card-text"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
            <p class="card-text"><strong>Provider:</strong> ${appointment.medicalProviderId.name}</p>
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
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${appointment.serviceId.name}</h5>
            <p class="card-text"><strong>Description:</strong> ${appointment.serviceId.description}</p>
            <p class="card-text"><strong>Location:</strong> ${appointment.serviceId.location}</p>
            <p class="card-text"><strong>Cost:</strong> $${appointment.serviceId.cost}</p>
            <p class="card-text"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
            <p class="card-text"><strong>Booked by:</strong> ${appointment.userId.name} (${appointment.userId.phone})</p>
          </div>
        </div>`;
      $('#appointments-container').append(appointmentCard);
    });
  }

  // Initial fetch
  fetchCurrentUserAndAppointments();
});
