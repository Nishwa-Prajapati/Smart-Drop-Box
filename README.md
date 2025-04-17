# 📦 Smart Drop Box - Final Year Project (Ongoing)

**Status:** 🚧 Ongoing | 👩‍💻 Final Year B.E. Project  
**Tech Stack:** HTML, CSS, JavaScript, Node.js, MySQL, Docker

---

---

## 🔍 What is Smart Drop Box?

The **Smart Drop Box** is a secure, IoT-based parcel delivery solution designed to eliminate missed or delayed deliveries. It allows delivery agents to safely drop off parcels without the recipient being physically present. With OTP verification and order ID validation, this system ensures reliable and secure delivery handling.

This is a hands-on, end-to-end project built as part of my **final year engineering curriculum**, combining frontend, backend, database integration, and real-time authentication features.

> ⚙️ **Note**: The hardware component and circuitry for the drop box have been built separately, but the final prototype is still under development. Hence, it's not included in this repository. However, a **circuit image** of the current setup is available in the `IMAGES` folder for reference.

---
---

## 🎯 Key Features

- ✅ **Password-Protected Access** – Only valid users can access the system.
- 🔑 **Unique Order ID & OTP Validation** – A user-defined order ID links to the delivery agent’s form. A random 6-digit OTP is generated and sent via SMS and email upon verification.
- 📦 **Parcel Detection System** – Uses sensors (not implemented here, reserved for hardware integration) to detect parcel weight and trigger updates.
- 🔄 **Real-Time Parcel Status Updates** – Status updated in the backend and reflected to the user.
- 🔐 **Role-Based Pages** – Separate interfaces for:
  - User
  - Delivery Personnel
  - Main Dashboard

---

## 🧠 How It Works

1. **User Registration**: Sets a unique order ID while signing up.
2. **Order Matching**: Delivery agent enters the order ID on their interface.
3. **OTP Generation**: If matched, a 6-digit OTP is generated and sent.
4. **Authentication**: The OTP is used to unlock the drop box (future hardware integration).
5. **Parcel Update**: Once the parcel is placed, the system records and notifies the user.

---

## ⚙️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Workbench)
- **Authentication**: OTP-based using email and mobile
- **Tools**: Docker (optional), dotenv, nodemailer

---

## 🙋‍♀️ About Me

Hi! I'm **Nishwa Ashwin Prajapati**, a final year Computer Science Engineering student passionate about solving real-world problems using tech. This project reflects my interest in full-stack development, IoT, and practical security systems.

## 🤝 Contributions

This project is part of my academic curriculum, but I'm open to feedback, suggestions, and collaborative ideas! Feel free to open issues or reach out.

