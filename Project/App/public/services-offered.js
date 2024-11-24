$(document).ready(function () {
  let currentUser;

  // Fetch the current user
  function fetchCurrentUser() {
    $.ajax({
      url: '/current-user',
      method: 'GET',
      success: function (data) {
        if (data && data.role === 'MedicalProvider') {
          currentUser = data; // Store current user's details
          console.log('Logged in as:', currentUser);
        } else {
          console.error('Unauthorized access: Only Medical Providers can add services.');
          window.location.href = '/services-catalog'; // Redirect unauthorized users
        }
      },
      error: function () {
        console.error('Failed to fetch current user.');
        window.location.href = '/login'; // Redirect to login if not authenticated
      }
    });
  }

  // Save new service
  function saveNewService(serviceData) {
    $.ajax({
      url: '/api/services',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(serviceData),
      success: function (newService) {
        console.log('Service added successfully:', newService);
        $('#newServiceModal').modal('hide'); // Close the modal
        fetchServices(); // Refresh the service list
      },
      error: function (err) {
        console.error('Error adding service:', err);
        alert('Failed to add service. Please try again.');
      }
    });
  }

  // Fetch all services offered by the current Medical Provider
  function fetchServices() {
    $.ajax({
      url: '/api/services',
      method: 'GET',
      success: function (services) {
        console.log('Fetched services:', services);
        renderServices(services);
      },
      error: function () {
        console.error('Failed to fetch services.');
        $('#services-container').empty().append('<p>Failed to load services.</p>');
      }
    });
  }

  // Render the services offered
  function renderServices(services) {
    $('#services-container').empty();
    services.forEach(service => {
      const serviceCard = `
        <div class="col position-relative">
          <div class="card h-100">
            <img src="${service.photo || '../public/img/default-service.jpg'}" class="card-img-top" alt="${service.name}">
            <div class="card-body">
              <h5 class="card-title">${service.name}</h5>
              <p class="card-text">${service.description}</p>
              <p class="card-text"><strong>Cost:</strong> $${service.cost}</p>
            </div>
            <div class="card-footer">
              <button class="btn btn-danger delete-service-button" data-service-id="${service._id}">Delete</button>
            </div>
          </div>
          <div class="alert-container position-absolute" style="display: none;"></div>
        </div>`;
      $('#services-container').append(serviceCard);
    });

    // Add delete functionality
    $('.delete-service-button').click(function () {
      const serviceId = $(this).data('service-id');
      const alertContainer = $(this).closest('.col').find('.alert-container');
      handleDelete(serviceId, alertContainer, $(this));
    });
  }



  function handleDelete(serviceId, alertContainer, button) {
    // Get the button's position
    const buttonOffset = button.offset();
    const buttonHeight = button.outerHeight();

    // Style and position the alert container
    alertContainer.css({
      top: 200 + 'px', // Slightly below the button
      left: 100 + 'px', // Align with the button's left edge
      zIndex: 1000 // Ensure it floats above other elements
    }).html(`
      <div class="alert alert-warning" role="alert" style="width:290px">
        Are you sure you want to delete this service?
        <button class="btn btn-sm btn-danger confirm-delete">Yes</button>
        <button class="btn btn-sm btn-secondary cancel-delete">No</button>
      </div>
    `).fadeIn();

    // Handle confirmation
    alertContainer.find('.confirm-delete').click(function () {
      deleteService(serviceId, alertContainer);
    });

    // Handle cancellation
    alertContainer.find('.cancel-delete').click(function () {
      alertContainer.fadeOut();
    });
  }





  // Delete a service
  function deleteService(serviceId, alertContainer) {
    $.ajax({
      url: `/api/services/${serviceId}`,
      method: 'DELETE',
      success: function () {
        alertContainer.html(`
          <div class="alert alert-success" role="alert">
            Service deleted successfully.
          </div>
        `).fadeIn().delay(3000).fadeOut();
        fetchServices(); // Refresh the service list
      },
      error: function () {
        alertContainer.html(`
          <div class="alert alert-danger" role="alert">
            Failed to delete service. Please try again.
          </div>
        `).fadeIn().delay(3000).fadeOut();
      }
    });
  }



  // Handle form submission for adding a new service
  $('#new-service-form').submit(function (e) {
    e.preventDefault(); // Prevent page reload
    const serviceData = {
      name: $('#service-name').val(),
      description: $('#service-description').val(),
      cost: parseFloat($('#service-cost').val()),
      photo: $('#service-photo')[0].files[0] ? $('#service-photo')[0].files[0].name : null, // Simplified; assumes server handles file uploads
    };

    // Validate input
    if (!serviceData.name || !serviceData.description || isNaN(serviceData.cost)) {
      alert('Please fill out all required fields.');
      return;
    }

    saveNewService(serviceData);
  });

  // Initial fetch
  fetchCurrentUser();
  fetchServices();
});
