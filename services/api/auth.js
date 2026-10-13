// Authentication calls to the PHP backend.

import { API_BASE_URL } from "./config";

/**
 * Sends a POST request with a JSON body to the given action.
 * Returns the parsed JSON response from the API.
 */
async function postAction(action, payload) {
  const url = `${API_BASE_URL}?action=${action}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // The API always returns JSON, even on errors.
  const data = await response.json();
  return data;
}

/**
 * Registers a new user.
 * @param {object} payload - { full_name, email, username, password, phone, role, department_id, ... }
 */
export async function registerUser(payload) {
  return postAction("register", payload);
}

/**
 * Logs in a user.
 * @param {string} identifier - Email or username
 * @param {string} password
 */
export async function loginUser(identifier, password) {
  return postAction("login", { identifier, password });
}

/**
 * Logs out the current user by revoking their API token.
 * @param {string} token - The Bearer token
 */
export async function logoutUser(token) {
  const url = `${API_BASE_URL}?action=logout`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches the list of classrooms from the API.
 * @param {string} token - Bearer token
 * @param {object} filters - Optional { building, room_type, min_capacity, status }
 */
export async function fetchClassrooms(token, filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}?action=classrooms${query ? "&" + query : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches the list of equipment from the API.
 */
export async function fetchEquipment(token, filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}?action=equipment${query ? "&" + query : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Creates a new booking (classroom or equipment).
 * @param {string} token - Bearer token
 * @param {object} payload - { resource_type, resource_id, allocation_date, start_time, end_time, purpose, priority }
 */
export async function createBooking(token, payload) {
  const url = `${API_BASE_URL}?action=create-booking`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Fetches the current user's bookings.
 */
export async function fetchMyBookings(token) {
  const url = `${API_BASE_URL}?action=my-bookings`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches a single booking by ID.
 */
export async function fetchBooking(token, bookingId) {
  const url = `${API_BASE_URL}?action=booking&id=${bookingId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Cancels a booking by ID.
 */
export async function cancelBooking(token, bookingId, reason = "") {
  const url = `${API_BASE_URL}?action=cancel-booking`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ allocation_id: bookingId, reason }),
  });

  return response.json();
}

export async function fetchPendingBookings(token) {
  const url = `${API_BASE_URL}?action=pending-bookings`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

export async function approveBooking(token, bookingId) {
  const url = `${API_BASE_URL}?action=approve-booking`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ allocation_id: bookingId }),
  });
  return response.json();
}

export async function rejectBooking(token, bookingId, notes = "") {
  const url = `${API_BASE_URL}?action=reject-booking`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ allocation_id: bookingId, notes }),
  });
  return response.json();
}

export async function cancelApprovedBooking(token, bookingId, reason = '') {
    const url = `${API_BASE_URL}?action=cancel-approved-booking`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ allocation_id: bookingId, reason }),
    });
    return response.json();
}

export async function checkInBooking(token, bookingId) {
    const url = `${API_BASE_URL}?action=check-in`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ allocation_id: bookingId }),
    });
    return response.json();
}

export async function checkOutBooking(token, bookingId) {
    const url = `${API_BASE_URL}?action=check-out`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ allocation_id: bookingId }),
    });
    return response.json();
}
