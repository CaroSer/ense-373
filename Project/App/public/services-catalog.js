$(document).ready(function () {
  let currentUser;

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


  // Fetch all services offered by the current Medical Provider
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

  // Render the services offered
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
            <div class="card-footer">
              <button class="btn btn-primary" onclick="bookService('${service._id}')">Book</button>
            </div>
          </div>
        </div>`;
      $('#services-container').append(serviceCard);
    });
  }


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
