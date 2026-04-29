// Application State
let currentUser = null;
let currentPage = "home";

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  handleNavigation();
  setupEventListeners();
});

function initializeApp() {
  // Load saved user from localStorage
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUserUI();
  }

  // Determine initial page
  const path = window.location.pathname;
  if (path.includes("event-detail")) {
    currentPage = "event-detail";
  } else if (path.includes("tickets")) {
    currentPage = "tickets";
  } else if (path.includes("promoter")) {
    currentPage = "promoter";
  } else if (path.includes("organizer")) {
    currentPage = "organizer";
  } else {
    currentPage = "home";
  }
}

function handleNavigation() {
  // Navigation click handlers
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.dataset.nav;

      if (target === "logout") {
        handleLogout();
        return;
      }

      if (target === "tickets" && !currentUser) {
        alert("Please login to view tickets");
        showLoginModal();
        return;
      }

      if ((target === "promoter" || target === "organizer") && !currentUser) {
        alert("Please login to access dashboard");
        showLoginModal();
        return;
      }

      navigateTo(target);
    });
  });
}

function navigateTo(page) {
  // Always navigate within /HTML/ folder
  const basePath = "/HTML/";

  switch (page) {
    case "home":
      window.location.href = basePath + "index.html";
      break;
    case "login":
      window.location.href = basePath + "login.html";
      break;
    case "tickets":
      window.location.href = basePath + "tickets.html";
      break;
    case "checkout":
      window.location.href = basePath + "checkout.html";
      break;
    case "success":
      window.location.href = basePath + "success.html";
      break;
    case "profile":
      window.location.href = basePath + "profile.html";
      break;
    case "promoter":
      window.location.href = basePath + "promoter.html";
      break;
    case "organizer":
      window.location.href = basePath + "organizer.html";
      break;
    case "create-event":
      window.location.href = basePath + "create-event.html";
      break;
    case "calculator":
      window.location.href = basePath + "calculator.html";
      break;
    case "qr-scanner":
      window.location.href = basePath + "qr-scanner.html";
      break;
    default:
      window.location.href = basePath + "index.html";
  }
}

function setupEventListeners() {
  // Login Modal
  const loginBtn = document.querySelector("[data-action='login']");
  const loginModal = document.getElementById("loginModal");

  if (loginBtn) {
    loginBtn.addEventListener("click", showLoginModal);
  }

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = document.querySelector('input[name="loginType"]:checked').value;
      handleLogin(role);
    });
  }

  // Event detail page
  if (currentPage === "event-detail") {
    setupEventDetail();
  }

  // Tickets page
  if (currentPage === "tickets") {
    setupTicketsPage();
  }

  // Search
  const searchForm = document.querySelector("[data-action='search']");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.querySelector('input[name="search"]').value;
      console.log("Search query:", query);
    });
  }
}

function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function handleLogin(role) {
  const mockUser = {
    id: `user-${Date.now()}`,
    name:
      role === "customer"
        ? "John Doe"
        : role === "promoter"
          ? "Promoter Pro"
          : "Organizer Admin",
    email: `${role}@example.com`,
    role: role,
  };

  currentUser = mockUser;
  localStorage.setItem("currentUser", JSON.stringify(mockUser));
  updateUserUI();
  closeLoginModal();

  // Navigate to appropriate dashboard
  const basePath = "/HTML/";
  if (role === "promoter") {
    window.location.href = basePath + "promoter.html";
  } else if (role === "organizer") {
    window.location.href = basePath + "organizer.html";
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUserUI();
  const basePath = "/HTML/";
  window.location.href = basePath + "index.html";
}

function updateUserUI() {
  const userBtn = document.querySelector("[data-action='login']");
  const userLogout = document.querySelector("[data-nav='logout']");

  if (currentUser) {
    if (userBtn) {
      userBtn.textContent = currentUser.name;
      userBtn.classList.add("hidden");
    }
    if (userLogout) {
      userLogout.classList.remove("hidden");
    }
  } else {
    if (userBtn) {
      userBtn.textContent = "Login";
      userBtn.classList.remove("hidden");
    }
    if (userLogout) {
      userLogout.classList.add("hidden");
    }
  }
}

// EVENT DETAIL PAGE
function setupEventDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    window.location.href = "index.html";
    return;
  }

  const event = mockEvents.find((e) => e.id === eventId);
  if (!event) {
    showNotFound();
    return;
  }

  renderEventDetail(event);
}

function renderEventDetail(event) {
  const mainContent = document.querySelector(".event-main");
  if (!mainContent) return;

  // Render description
  const descriptionCard = mainContent.querySelector(".event-description");
  if (descriptionCard) {
    descriptionCard.innerHTML = `
      <div class="card">
        <div class="card-content">
          <h2>About This Event</h2>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  }

  // Render lineup
  const lineupContainer = document.querySelector(".artist-lineup");
  if (lineupContainer) {
    const artistsGrid = document.createElement("div");
    artistsGrid.className = "artist-grid";

    event.lineup.forEach((artist) => {
      const artistCard = document.createElement("div");
      artistCard.className = "artist-card";
      artistCard.innerHTML = `
        <div class="artist-image">
          <img src="${artist.image}" alt="${artist.name}" />
        </div>
        <div class="artist-info">
          <div class="artist-name">${artist.name}</div>
          <div class="artist-genre">${artist.genre}</div>
          <p class="artist-bio">${artist.bio}</p>
        </div>
      `;
      artistsGrid.appendChild(artistCard);
    });

    lineupContainer.innerHTML = "";
    lineupContainer.appendChild(artistsGrid);
  }

  // Render ticket phases
  const ticketContainer = document.querySelector(".ticket-phases");
  if (ticketContainer && event.ticketPhases.length > 0) {
    ticketContainer.innerHTML = "<h3>Ticket Phases</h3>";

    event.ticketPhases.forEach((phase) => {
      const phaseClass = phase.active ? "active" : "phase-inactive";
      const phaseDiv = document.createElement("div");
      phaseDiv.className = `ticket-phase ${phaseClass}`;
      phaseDiv.innerHTML = `
        <div class="phase-name">${phase.name}</div>
        <div class="phase-price">€${phase.price}</div>
        <div class="phase-available">Available: ${phase.available}/${phase.total}</div>
        <button class="btn-buy" ${phase.available === 0 || !phase.active ? "disabled" : ""} onclick="buyTicket('${event.id}', '${phase.id}')">
          ${phase.available === 0 ? "Sold Out" : "Buy Now"}
        </button>
      `;
      ticketContainer.appendChild(phaseDiv);
    });
  }

  // Banner image
  const heroBanner = document.getElementById("eventBanner");
  if (heroBanner) {
    heroBanner.style.backgroundImage = `url('${event.image}')`;
  }
}

function buyTicket(eventId, phaseId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  const modal = document.getElementById("purchaseModal");
  if (modal) {
    modal.classList.add("active");
    setTimeout(() => {
      modal.classList.remove("active");
      window.location.href = "tickets.html";
    }, 2000);
  }
}

// TICKETS PAGE
function setupTicketsPage() {
  renderTickets();
}

function renderTickets() {
  const ticketsContainer = document.querySelector(".tickets-list");
  if (!ticketsContainer) return;

  if (mockTickets.length === 0) {
    ticketsContainer.innerHTML = `
      <div class="text-center" style="padding: 3rem 0;">
        <h3>No tickets yet</h3>
        <p class="text-muted">Purchase a ticket to see it here</p>
      </div>
    `;
    return;
  }

  ticketsContainer.innerHTML = mockTickets
    .map(
      (ticket) => `
    <div class="ticket-item">
      <div class="ticket-details">
        <h3>${ticket.eventTitle}</h3>
        <div class="ticket-info">
          <div class="ticket-info-row">
            <span class="ticket-info-label">Date:</span>
            <span class="ticket-info-value">${formatDate(ticket.eventDate)}</span>
          </div>
          <div class="ticket-info-row">
            <span class="ticket-info-label">Location:</span>
            <span class="ticket-info-value">${ticket.eventLocation}</span>
          </div>
          <div class="ticket-info-row">
            <span class="ticket-info-label">Phase:</span>
            <span class="ticket-info-value">${ticket.phase}</span>
          </div>
          <div class="ticket-info-row">
            <span class="ticket-info-label">Price:</span>
            <span class="ticket-info-value">€${ticket.price}</span>
          </div>
        </div>
      </div>
      <div class="ticket-qr">
        <img src="${ticket.qrCode}" alt="QR Code" />
        <p class="text-muted" style="font-size: 0.75rem; margin-top: 0.5rem;">ID: ${ticket.id}</p>
      </div>
    </div>
  `
    )
    .join("");
}

// EVENT NAVIGATION
function goToEvent(eventId) {
  const basePath = "/HTML/";
  window.location.href = basePath + `event-detail.html?id=${eventId}`;
}

// UTILITIES
function showNotFound() {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `
      <div class="text-center" style="padding: 4rem 0;">
        <h2>Event Not Found</h2>
        <button class="btn-primary" onclick="navigateTo('home')" style="margin-top: 1rem;">Back to Homepage</button>
      </div>
    `;
  }
}

function formatDate(dateString, format = "pt-PT") {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString(format, options);
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  const modal = e.target.closest(".modal-overlay");
  if (modal && e.target === modal) {
    modal.classList.remove("active");
  }
});

// Close modal button
document.querySelectorAll("[data-action='close-modal']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal-overlay");
    if (modal) {
      modal.classList.remove("active");
    }
  });
});

// SVG Icons - Simple inline SVG versions
const icons = {
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
  calendar:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  mapPin:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>',
  image:
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
  music:
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18v-3H5v3H9M15 18v-3h-4v3H15M21 18v-3h-4v3H21M9 15A2 2 0 0 0 7 13V5a2 2 0 0 0-2-2H3v2h2v8a2 2 0 0 0 2 2h4v-2H9Z"></path></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  logOut:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
};

// Inject icons - This is a helper function
function injectIcon(elementSelector, iconName) {
  const elements = document.querySelectorAll(elementSelector);
  elements.forEach((el) => {
    if (icons[iconName]) {
      el.innerHTML = icons[iconName] + el.innerHTML;
    }
  });
}
