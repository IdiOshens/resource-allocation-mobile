import { API_BASE_URL } from "./config";

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
 * @param {string} token - Bearer token
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
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
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
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 * @param {string} reason
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

/**
 * Cancels an already approved booking (admin or owner).
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 * @param {string} reason
 */
export async function cancelApprovedBooking(token, bookingId, reason = "") {
  const url = `${API_BASE_URL}?action=cancel-approved-booking`;

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

/**
 * Reschedules a pending or approved booking.
 */
export async function rescheduleBooking(
  token,
  allocationId,
  newDate,
  newStart,
  newEnd,
) {
  const url = `${API_BASE_URL}?action=reschedule-booking`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      allocation_id: allocationId,
      allocation_date: newDate,
      start_time: newStart,
      end_time: newEnd,
    }),
  });

  return response.json();
}

/**
 * Checks in to a booking.
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 */
export async function checkInBooking(token, bookingId) {
  const url = `${API_BASE_URL}?action=check-in`;

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

/**
 * Checks out of a booking.
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 */
export async function checkOutBooking(token, bookingId) {
  const url = `${API_BASE_URL}?action=check-out`;

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
