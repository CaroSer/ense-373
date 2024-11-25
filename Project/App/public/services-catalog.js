$(document).ready(function () {
  let currentUser;
  let selectedService = null;

  // Fetch the current user
  function fetchCurrentUser() {
    $.ajax({
      url: '/current-user',
      method: 'GET',
      success: function (data) {
        if (data && data.role) {
          currentUser = data; // Store current user's details
          console.log('Logged in as:', currentUser);
        } else {
          window.location.href = '/services-catalog'; // Redirect unauthorized users
        }
      },
      error: function () {
        console.error('Failed to fetch current user.');
        window.location.href = '/login'; // Redirect to login if not authenticated
      }
    });
  }

  // Fetch all services
  function fetchServices() {
    $.ajax({
      url: '/api/services/catalog',
      method: 'GET',
      success: function (services) {
        renderServices(services);
      },
      error: function () {
        console.error('Failed to fetch services.');
        $('#services-container').empty().append('<p>Failed to load services.</p>');
      }
    });
  }

  // Render the services
  function renderServices(services) {
    $('#services-container').empty();
    services.forEach(service => {
      const serviceCard = `
        <div class="col service-card" data-name="${service.name.toLowerCase()}">
          <div class="card h-100">
            <img src="${service.photo || '../public/img/default-service.jpg'}" class="card-img-top" alt="${service.name}">
            <div class="card-body">
              <h5 class="card-title">${service.name}</h5>
              <p class="card-text">${service.description}</p>
              <p class="card-text"><strong>Cost:</strong> $${service.cost}</p>
              <p class="card-text">Location: ${service.location}</p>
            </div>
            ${currentUser.role !== 'MedicalProvider' ? `
              <div class="card-footer">
                <button class="btn btn-primary" onclick="bookService('${service._id}', '${service.name}', '${service.medicalProviderId.name}')">Book</button>
              </div>
            ` : ''}
          </div>
        </div>`;
      $('#services-container').append(serviceCard);
    });
  }

  // Open the booking modal
  window.bookService = function (serviceId, serviceName, providerName) {
    selectedService = serviceId; // Store the selected service ID
    $('#bookAppointmentModalLabel').text(`Book Appointment for ${serviceName}`); // Set the modal title
    $('#appointment').val(serviceName);
    $('#bookAppointmentModal').modal('show');
  };

  // Function to show the popover message
  function showPopover(message, type) {
    const popover = $('#message-popover');
    popover
      .removeClass('popover-success popover-error')
      .addClass(type === 'success' ? 'popover-success' : 'popover-error')
      .text(message)
      .fadeIn(300);

    setTimeout(() => {
      popover.fadeOut(300);
    }, 3000);
  }

  function showNotification(message, type) {
    const notification = $('#appointment-message');
    notification
      .removeClass('text-success text-danger')
      .addClass(type === 'success' ? 'text-success' : 'text-danger')
      .text(message)
      .fadeIn(300);

    setTimeout(() => {
      notification.fadeOut(300);
    }, 3000);
  }

  // Handle form submission for booking an appointment
  $('#book-appointment-form').submit(function (e) {
    e.preventDefault(); // Prevent page reload

    const appointmentDate = $('#appointment-date').val();
    console.log(appointmentDate);
    const selectedDate = new Date(appointmentDate);
    const now = new Date();

    // Set the time to midnight for both dates to compare only the date part
    selectedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (selectedDate <= now) {
      showNotification('The appointment date must be in the future.', 'error');
      return;
    }

    if (!currentUser || !selectedService) {
      showPopover('Unable to book appointment. Please try again.', 'error');
      return;
    }

    const appointmentData = {
      serviceId: selectedService,
      userId: currentUser._id,
      appointmentDate: appointmentDate,
    };

    $.ajax({
      url: '/api/appointments',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(appointmentData),
      success: function () {
        showPopover('Appointment booked successfully!', 'success');
        $('#bookAppointmentModal').modal('hide'); // Close the modal
      },
      error: function (err) {
        console.error('Error booking appointment:', err);
        showPopover('Failed to book appointment. Please try again.', 'error');
      }
    });
  });

  // Search functionality
  const searchBar = document.getElementById('search-bar');
  searchBar.addEventListener('input', function () {
    const query = searchBar.value.toLowerCase();
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
      const name = card.getAttribute('data-name');
      if (name.includes(query)) {
        card.style.display = 'block'; // Show matching cards
      } else {
        card.style.display = 'none'; // Hide non-matching cards
      }
    });
  });

  // Initial fetch
  fetchCurrentUser();
  fetchServices();
});
