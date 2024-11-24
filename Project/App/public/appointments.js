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
        $('#appointments-container').empty().append('<p>You do not have any pending appointmens.</p>');
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
            <button class="btn btn-danger cancel-appointment-button" data-id="${appointment._id}">Cancel</button>

          </div>
                   <div class="alert-container position-absolute" style="display: none;"></div>

          </div>
        </div>`;
      $('#appointments-container').append(appointmentCard);




      $('.cancel-appointment-button').click(function () {
        const appointmentId = $(this).data('id');
        const alertContainer = $(this).closest('.col').find('.alert-container');
        handleDelete(appointmentId, alertContainer, $(this));

      });

    });
  }


  // Render appointments for Medical Providers
  function renderProviderAppointments(appointments) {
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
           <div class="card-body">
            <h5 class="card-title">${appointment.serviceId.name}</h5>
            <p class="card-text"><strong>Description:</strong> ${appointment.serviceId.description}</p>
            <p class="card-text"><strong>Location:</strong> ${appointment.serviceId.location}</p>
            <p class="card-text"><strong>Cost:</strong> $${appointment.serviceId.cost}</p>
            <p class="card-text"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
            <p class="card-text"><strong>Booked by:</strong> ${appointment.userId.name}</p>
            <p class="card-text"><strong>Contact:</strong> ${appointment.userId.phone}</p>
            <button class="btn btn-danger cancel-appointment-button" data-id="${appointment._id}">Cancel</button>

          </div>
                   <div class="alert-container position-absolute" style="display: none;"></div>

          </div>
        </div>`;
      $('#appointments-container').append(appointmentCard);




      $('.cancel-appointment-button').click(function () {
        const appointmentId = $(this).data('id');
        const alertContainer = $(this).closest('.col').find('.alert-container');
        handleDelete(appointmentId, alertContainer, $(this));

      });

    });
  }

  // Cancel an appointment
  function cancelAppointment(appointmentId) {

    $.ajax({
      url: `/api/appointments/${appointmentId}`, // Backend route to cancel the appointment
      method: 'DELETE',
      success: function (response) {
        showPopover('Appointment cancelled successfully!', 'success'); // Notify the user
        fetchAppointments(); // Refresh the list of appointments
      },
      error: function (err) {
        console.error('Failed to cancel appointment:', err); // Log error
        showPopover('Failed to cancel appointment. Please try again.', 'error'); // Show error message
      }
    });
  }

  function showPopover(message, type) {
    const popover = document.getElementById('message-popover');
    popover.className = `popover-message popover-${type}`;
    popover.textContent = message;
    popover.style.display = 'block';

    setTimeout(() => {
      popover.style.display = 'none';
    }, 3000);
  }

  function handleDelete(serviceId, alertContainer, button) {
    // Get the button's position
    const buttonOffset = button.offset();
    const buttonHeight = button.outerHeight();

    // Style and position the alert container
    alertContainer.css({
      top: 265 + 'px', // Slightly below the button
      left: 90 + 'px', // Align with the button's left edge
      zIndex: 1000 // Ensure it floats above other elements
    }).html(`
      <div class="alert alert-warning" role="alert" style="width:290px">
        Are you sure you want to cancel your appointment?
        <button class="btn btn-sm btn-danger confirm-delete">Yes</button>
        <button class="btn btn-sm btn-secondary cancel-delete">No</button>
      </div>
    `).fadeIn();

    // Handle confirmation
    alertContainer.find('.confirm-delete').click(function () {
      cancelAppointment(serviceId, alertContainer);
    });

    // Handle cancellation
    alertContainer.find('.cancel-delete').click(function () {
      alertContainer.fadeOut();
    });
  }

  // Initial fetch
  fetchCurrentUserAndAppointments();
});
