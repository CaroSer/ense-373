$(document).ready(function () {
  let currentUser;
  let selectedService = null;


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
              <button class="btn btn-primary edit-service-button" data-service-id="${service._id}">Edit</button>
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


    $('.edit-service-button').click(function () {
      const serviceId = $(this).data('service-id');
      selectedService = services.find(service => service._id === serviceId); // Assign selected service globally

      // Populate the edit form with service details
      $('#edit-service-name').val(selectedService.name);
      $('#edit-service-description').val(selectedService.description);
      $('#edit-service-cost').val(selectedService.cost);
      $('#edit-service-location').val(selectedService.location || ''); // Handle optional fields
      $('#editServiceModal').modal('show');
    });

  }
  // Handle form submission for editing a service
  $('#edit-service-form').submit(function (e) {
    e.preventDefault(); // Prevent page reload

    if (!selectedService) {
      alert('No service selected for editing.');
      return;
    }

    const formData = {
      _id: selectedService._id,
      name: $('#edit-service-name').val(),
      description: $('#edit-service-description').val(),
      cost: parseFloat($('#edit-service-cost').val()),
      location: $('#edit-service-location').val(),
      photo: $('#edit-service-photo')[0].files[0] ? $('#edit-service-photo')[0].files[0].name : selectedService.photo // Use existing photo if no new file
    };

    // Validate input
    if (!formData.name || !formData.description || isNaN(formData.cost)) {
      alert('Please fill out all required fields.');
      return;
    }

    updateService(formData); // Call the update function
  });


  function updateService(serviceData) {
    $.ajax({
      url: `/api/services/${serviceData._id}`,
      method: 'PUT',
      contentType: 'application/json', // Ensure data is sent as JSON
      data: JSON.stringify(serviceData), // Serialize the service data
      success: function () {
        showPopover('Service updated successfully!', 'success');
        $('#editServiceModal').modal('hide');
        fetchServices(); // Refresh the service list
      },
      error: function () {
        showPopover('Failed to update service. Please try again.', 'error');
      }
    });
  }


  function handleDelete(serviceId, alertContainer, button) {
    // Get the button's position
    const buttonOffset = button.offset();
    const buttonHeight = button.outerHeight();

    // Style and position the alert container
    alertContainer.css({
      top: 330 + 'px', // Slightly below the button
      left: 160 + 'px', // Align with the button's left edge
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
        showPopover('Service deleted successfully!', 'success');

        fetchServices(); // Refresh the service list
      },
      error: function () {
        showPopover('Failed to delete service. Please try again.', 'error');
        ;
      }
    });
  }

  document.getElementById('new-service-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    // Create FormData object to handle the form data, including file
    const formData = new FormData();

    // Append all form fields to FormData
    formData.append('name', document.getElementById('service-name').value);
    formData.append('description', document.getElementById('service-description').value);
    formData.append('cost', document.getElementById('service-cost').value);
    formData.append('photo', document.getElementById('service-photo').files[0]); // Make sure file is selected

    // Send AJAX request
    fetch('/api/services', {
      method: 'POST',
      body: formData,
      headers: {
        // You can set other headers here, but **do not set Content-Type**. Let FormData handle that.
        // 'Content-Type': 'multipart/form-data' // Do NOT set this manually with FormData
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Service added successfully:', data);
        showPopover('Service added successfully!', 'success');
        $('#newServiceModal').modal('hide'); // Close the modal
        fetchServices(); // Refresh the service list
        // Handle success (e.g., close modal, show success message)
      })
      .catch(error => {
        console.error('Error adding service:', err);
        showPopover('Failed to add service. Please try again.', 'error');
        $('#newServiceModal').modal('hide'); // Close the modal
        // Handle error
      });
  });
  // Save new service

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
  // Initial fetch
  fetchCurrentUser();
  fetchServices();
});
