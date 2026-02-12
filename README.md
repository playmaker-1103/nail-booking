# 💅 Professional Nail Booking System

A full-stack booking engine designed to automate appointment management, optimize resource allocation, and provide a secure administrative interface. This project solves the complexity of real-time scheduling in a multi-service environment.

## 🌟 High-Level Overview

This system was built to replace manual booking processes with an automated, conflict-free digital infrastructure. It ensures that staff availability, service durations, and customer requests are synchronized perfectly.

### Key Solved Problems:
- **Resource Conflicts:** Engineered a logic-gate to prevent double-booking of time slots and staff.
- **Data Integrity:** Implemented atomic-like transactions to ensure booking data remains consistent under concurrent requests.
- **Secure Governance:** Built an Admin-only dashboard with encrypted access to manage business-critical data.

---

## 🛠 Tech Stack & Tools

- **Backend:** Node.js, Express.js (RESTful API Design)
- **Database:** MongoDB & Mongoose (Document-based modeling)
- **Security:** JWT (JSON Web Tokens)
- **Testing:** Postman API Testing
- **DevOps:** Git, Environment Configuration (.env)

---

## 🏗 System Architecture & Design

I followed the **Separation of Concerns (SoC)** principle to ensure the codebase is maintainable and scalable:

1. **Modeling Layer:** Defined complex schemas to map relationships between `Staff`, `Services`, and `TimeSlots`.
2. **Business Logic Layer (Services):** Isolated the core booking algorithms from the HTTP delivery logic.
3. **Security Middleware:** A central authentication layer that validates sessions before granting access to the Admin Dashboard.

---

## 🔑 Administrative Features

- **Admin Authentication:** Secure login system using hashed credentials.
- **Dynamic Booking Management:** Admins can view, modify, or delete appointments for any specific "Booking Day".
- **Capacity Control:** Ability to set specific working hours and break times for the salon infrastructure.

---

## 🚀 Installation & Local Development

1. **Clone the Repo:**
   ```bash
   git clone [https://github.com/playmaker-1103/nail-booking.git](https://github.com/playmaker-1103/nail-booking.git)
