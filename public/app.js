// app.js — clean version without debug list

const serviceSelect = document.getElementById("serviceSelect");
const durationInput = document.getElementById("duration");
const resultOut = document.getElementById("resultOut");
let SERVICES = [];

// Load services from server
async function loadServices() {
  try {
    const r = await fetch("/api/services");
    if (!r.ok) {
      resultOut.textContent = `❌ Failed to load services: ${r.status}`;
      return;
    }

    SERVICES = await r.json();

    serviceSelect.innerHTML = "";
    SERVICES.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.durationMinutes}′)`;
      serviceSelect.appendChild(opt);
    });

    if (SERVICES[0]) {
      durationInput.value = SERVICES[0].durationMinutes;
    }
  } catch (err) {
    console.error("loadServices error:", err);
    resultOut.textContent = "❌ Network error when loading services.";
  }
}

// When user changes service, sync duration input
serviceSelect.addEventListener("change", () => {
  const s = SERVICES.find((x) => String(x.id) === serviceSelect.value);
  if (s) durationInput.value = s.durationMinutes;
});

// Handle booking form submit
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(e.target);
  const svc = SERVICES.find((x) => String(x.id) === serviceSelect.value);
  const duration = svc ? svc.durationMinutes : 30;

  const start = new Date(fd.get("startTime"));
  const end = new Date(start.getTime() + duration * 60000);

  const payload = {
    serviceId: serviceSelect.value,
    clientName: fd.get("name"),
    clientPhone: fd.get("phone"),
    clientEmail: fd.get("email") || undefined,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 201) {
      const d = await res.json();
      const timeFmt = start.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      resultOut.textContent =
        `✅ Booking created successfully!\n` +
        `Booking ID: ${d.id}\n` +
        `Service: ${svc ? svc.name : serviceSelect.value}\n` +
        `Time: ${timeFmt}\n` +
        `Duration: ${duration} minutes`;
    } else {
      const err = await res.json().catch(() => ({}));
      resultOut.textContent = `❌ Error ${res.status}: ${JSON.stringify(err)}`;
    }
  } catch (err) {
    console.error("booking error:", err);
    resultOut.textContent = "❌ Network error when creating booking.";
  }
});

// initial load
loadServices();
