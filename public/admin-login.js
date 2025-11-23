// admin-login.js

const form = document.getElementById("loginForm");
const out = document.getElementById("loginResult");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  out.textContent = "";

  const fd = new FormData(form);
  const payload = {
    email: fd.get("email"),
    password: fd.get("password"),
  };

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      out.textContent = `❌ Lỗi: ${data.error || JSON.stringify(data)}`;
      return;
    }

    // Lưu token
    localStorage.setItem("adminToken", data.token);
    out.textContent = "✅ Login thành công, chuyển sang trang admin...";
    setTimeout(() => {
      window.location.href = "/admin.html";
    }, 800);
  } catch (err) {
    console.error(err);
    out.textContent = "❌ Network error";
  }
});
