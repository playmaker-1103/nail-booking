// =========================
// ADMIN DASHBOARD LOGIC
// =========================

const tableBody = document.getElementById("adminTable");
const infoBox = document.getElementById("adminInfo");
const filterInput = document.getElementById("filterDate");

// =========================
// TOKEN HELPERS
// =========================

function getToken() {
  return localStorage.getItem("adminToken");
}

function ensureLoggedIn() {
  const token = getToken();
  if (!token) {
    window.location.href = "/admin-login.html";
  }
}
ensureLoggedIn();

// =========================
// LOAD BOOKINGS
// =========================

async function loadBookings(dateFilter = null) {
  try {
    const token = getToken();
    if (!token) {
      return (window.location.href = "/admin-login.html");
    }

    let url = "/api/admin/bookings";
    if (dateFilter) url += `?date=${dateFilter}`;

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (r.status === 401 || r.status === 403) {
      localStorage.removeItem("adminToken");
      return (window.location.href = "/admin-login.html");
    }

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      infoBox.textContent = `❌ Lỗi tải booking: ${r.status} ${JSON.stringify(err)}`;
      tableBody.innerHTML = "";
      return;
    }

    const data = await r.json();
    renderTable(data, dateFilter);
  } catch (err) {
    console.error("loadBookings error:", err);
    infoBox.textContent = "❌ Network error khi tải booking.";
  }
}

// =========================
// RENDER TABLE
// =========================

function renderTable(rows, dateFilter) {
  tableBody.innerHTML = "";

  if (!rows.length) {
    infoBox.textContent = dateFilter
      ? `Không có booking nào trong ngày ${dateFilter}.`
      : "Chưa có booking nào.";
    return;
  }

  infoBox.textContent = `Tổng số booking: ${rows.length}`;

  rows.forEach((b) => {
    const tr = document.createElement("tr");

    const startStr = new Date(b.startTime).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const endStr = new Date(b.endTime).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const statusClass = `status-${b.status}`;

    tr.innerHTML = `
      <td>${b.serviceName || "(đã xóa dịch vụ)"}</td>
      <td>${b.clientName}</td>
      <td>${b.clientPhone}</td>
      <td>${startStr}</td>
      <td>${endStr}</td>
      <td class="${statusClass}">${b.status}</td>
      <td>
        <button onclick="confirmBooking('${b.id}')">Confirm</button>
        <button onclick="cancelBooking('${b.id}')">Cancel</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// =========================
// CANCEL BOOKING
// =========================

async function cancelBooking(id) {
  if (!confirm("Hủy booking này?")) return;

  try {
    const token = getToken();

    const r = await fetch(`/api/admin/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      alert("Lỗi hủy booking: " + JSON.stringify(err));
    }

    reloadWithCurrentFilter();
  } catch (err) {
    console.error("cancelBooking error:", err);
    alert("Network error khi hủy booking");
  }
}

// =========================
// CONFIRM BOOKING
// =========================

async function confirmBooking(id) {
  try {
    const token = getToken();

    const r = await fetch(`/api/admin/bookings/${id}/confirm`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      alert("Lỗi confirm booking: " + JSON.stringify(err));
    }

    reloadWithCurrentFilter();
  } catch (err) {
    console.error("confirmBooking error:", err);
    alert("Network error khi confirm booking");
  }
}

// =========================
// HELPERS
// =========================

function reloadWithCurrentFilter() {
  const date = filterInput.value || null;
  loadBookings(date);
}

// =========================
// EVENT LISTENERS
// =========================

document.getElementById("btnFilter").addEventListener("click", () => {
  const date = filterInput.value;
  loadBookings(date || null);
});

document.getElementById("btnClear").addEventListener("click", () => {
  filterInput.value = "";
  loadBookings();
});

// =========================
// INITIAL LOAD
// =========================

loadBookings();
