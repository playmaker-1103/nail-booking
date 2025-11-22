const serviceSelect = document.getElementById("serviceSelect");
const durationInput = document.getElementById("duration");
const resultOut = document.getElementById("resultOut");
const listOut = document.getElementById("listOut");
let SERVICES = [];

// Load dịch vụ từ server
async function loadServices() {
  const r = await fetch("/api/services");
  SERVICES = await r.json();
  serviceSelect.innerHTML = "";
  SERVICES.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.durationMinutes}′)`;
    serviceSelect.appendChild(opt);
  });
  if (SERVICES[0]) durationInput.value = SERVICES[0].durationMinutes;
}
serviceSelect.addEventListener("change", () => {
  const s = SERVICES.find((x) => String(x.id) === serviceSelect.value);
  if (s) durationInput.value = s.durationMinutes;
});

// Bắt sự kiện submit form đặt lịch
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

  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = document.getElementById("resultOut");
  if (res.status === 201) {
    const d = await res.json();
    const timeFmt = start.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    out.textContent =
      `✅ Đặt lịch thành công!\n` +
      `Mã booking: ${d.id}\n` +
      `Dịch vụ: ${svc.name}\n` +
      `Thời gian: ${timeFmt}\n` +
      `Thời lượng: ${duration} phút`;
  } else {
    const err = await res.json().catch(() => ({}));
    out.textContent = `❌ Lỗi ${res.status}: ${JSON.stringify(err)}`;
  }
});

// Nút tải danh sách
document
  .getElementById("btnLoadBookings")
  .addEventListener("click", async () => {
    const r = await fetch("/api/bookings");
    const d = await r.json();
    listOut.textContent = JSON.stringify(d, null, 2);
  });

loadServices();
