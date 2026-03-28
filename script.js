const API_URL = "http://localhost:5001";

let eventsData = [];

async function loadEvents() {
  const eventsContainer = document.getElementById("events");

  try {
    const response = await fetch(`${API_URL}/events`);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();
    eventsData = data;

    displayEvents(eventsData);
    populateDropdown(eventsData);
  } catch (error) {
    console.error("Error loading events:", error);
    eventsContainer.innerHTML =
      "<p>Could not load events. Please check backend and Airtable setup.</p>";
  }
}

function displayEvents(events) {
  const container = document.getElementById("events");
  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach((record) => {
    const fields = record.fields;

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${fields.name || "Untitled Event"}</h3>
      <p><strong>Date:</strong> ${fields.date || "N/A"}</p>
      <p><strong>Location:</strong> ${fields.location || "N/A"}</p>
      <p><strong>Seats:</strong> ${fields.seats ?? "N/A"}</p>
    `;

    container.appendChild(card);
  });
}

function populateDropdown(events) {
  const select = document.getElementById("eventSelect");
  select.innerHTML = '<option value="">Select an event</option>';

  events.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.fields.name;
    option.textContent = record.fields.name;
    select.appendChild(option);
  });
}

document.getElementById("search").addEventListener("input", (event) => {
  const searchValue = event.target.value.toLowerCase();

  const filteredEvents = eventsData.filter((record) =>
    (record.fields.name || "").toLowerCase().includes(searchValue)
  );

  displayEvents(filteredEvents);
});

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message");
  message.textContent = "";
  message.className = "";

  const bookingData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    event: document.getElementById("eventSelect").value
  };

  if (!bookingData.name || !bookingData.email || !bookingData.event) {
    message.textContent = "Please complete all fields.";
    message.className = "error";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    message.textContent = "Booking successful!";
    message.className = "success";
    document.getElementById("bookingForm").reset();
  }  catch (error) {
    console.error("Error booking event:", error);
    message.textContent = `Booking failed: ${error.message}`;
    message.className = "error";
  }
});

loadEvents();