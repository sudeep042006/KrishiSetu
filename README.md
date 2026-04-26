<div align="center">

<img src="https://res.cloudinary.com/dwji50nl9/image/upload/v1777178237/ic_launcher_round_vvbxyt.png" alt="KrishiSetu Logo" width="120" height="120" />

# 🌾 KrishiSetu

### *Bridging Farmers and Buyers Through Smart Digital Contract Farming*

[![Project](https://img.shields.io/badge/Semester%204-Micro%20Project-green?style=for-the-badge)](https://github.com/sudeep042006/KrishiSetu)
[![Domain](https://img.shields.io/badge/Domain-Agriculture-brightgreen?style=for-the-badge&logo=leaf)](https://github.com/sudeep042006/KrishiSetu)
[![Status](https://img.shields.io/badge/Status-Under%20Development-orange?style=for-the-badge)](https://github.com/sudeep042006/KrishiSetu)
[![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)](https://github.com/sudeep042006/KrishiSetu)

</div>

---

## 📌 What is KrishiSetu?

**KrishiSetu** (Hindi: *Krishi* = Agriculture, *Setu* = Bridge) is a mobile-first digital platform that modernizes contract farming by creating a trusted, transparent bridge between **farmers**, **buyers/offtakers**, and **administrators**.

> Farmers today face uncertain pricing, middlemen dependency, and zero digital presence. Buyers struggle to find verified farmers and manage procurement. KrishiSetu solves both sides of this broken chain.

---

## 🎯 Problem → Solution

| Problem | KrishiSetu's Solution |
|---|---|
| Farmers lack direct market access | Digital farmer–buyer marketplace |
| No transparent contract system | Structured contract & milestone tracking |
| Middlemen exploitation | Direct proposal & negotiation flow |
| No verified farmer profiles | Profile-based trust & review system |
| Disorganized payments | Wallet & payment milestone tracking |
| No admin oversight | Admin panel with full moderation control |

---

## 🧩 Core Modules

<details>
<summary><b>👨‍🌾 Farmer Module</b></summary>

- Create and manage professional agricultural profiles
- List current or upcoming crops with details
- Receive and respond to buyer proposals
- Track active contracts and milestones

</details>

<details>
<summary><b>🏢 Buyer / Offtaker Module</b></summary>

- Register and browse verified farmer listings
- Discover crops by category, quantity, and region
- Send structured proposals to farmers
- Manage procurement and contract workflows

</details>

<details>
<summary><b>📄 Contract & Milestone Management</b></summary>

- Structured contract creation between two parties
- Track contract status, terms, and delivery milestones
- Maintain records of all agreements

</details>

<details>
<summary><b>💰 Payment & Wallet</b></summary>

- Wallet-based transaction logic
- Payment milestone tracking per contract
- Structured financial flow with future scalability

</details>

<details>
<summary><b>🛠️ Admin Panel</b></summary>

- Monitor all users, contracts, and proposals
- Verify accounts and moderate platform activity
- Maintain system integrity and logs

</details>

---

## 🚀 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| 📱 Frontend | React Native · JavaScript |
| 🖥️ Backend | Node.js · Express.js |
| 🗄️ Database | MongoDB · Mongoose |
| 🔐 Auth | JWT · Bcrypt |
| 🛠️ Dev Tools | Git · GitHub · Postman · VS Code |

</div>

---

## 🏗️ Project Architecture

```
KrishiSetu/
├── frontend/              # React Native mobile app
│   ├── screens/
│   ├── components/
│   └── navigation/
├── backend/               # Node.js + Express REST API
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route handlers
│   ├── controllers/
│   └── middleware/        # Auth & validation
└── README.md
```

**Database Modules:** `User` · `FarmerProfile` · `BuyerProfile` · `Crop` · `Proposal` · `Contract` · `Milestone` · `Payment` · `Wallet` · `Review` · `AdminLog`

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)

### 1. Clone the Repository

```bash
git clone https://github.com/sudeep042006/KrishiSetu.git
cd KrishiSetu
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm run dev
```

> Backend will be running at `http://localhost:5000`

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npx react-native start
```

Run on device/emulator:

```bash
# Android
npx react-native run-android

# iOS (macOS only)
npx react-native run-ios
```

---

## 🔮 Roadmap & Future Enhancements

- [ ] 📍 Location-based farmer discovery
- [ ] 💬 In-app chat between farmers and buyers
- [ ] 🪪 Farmer verification system
- [ ] 📈 Crop analytics and demand forecasting
- [ ] 🌦️ Weather and agricultural advisory integration
- [ ] 🧠 AI-based crop recommendations
- [ ] 📄 Smart digital contracts
- [ ] 💳 Secure payment gateway integration
- [ ] 🌐 Multi-language support for rural accessibility

---

## 🌍 Why KrishiSetu Matters

Agriculture drives the economy, yet millions of farmers remain disconnected from the digital market. KrishiSetu is an attempt to bridge traditional farming with modern digital infrastructure — making the contract farming process **secure**, **transparent**, and **accessible** for everyone in the value chain.

---

## 👨‍💻 About the Project

This project is developed as a **4th Semester Micro Project** at **ST. Vincent Pallotti College of Engineering and Technology, Nagpur** by **Sudeep Kuralkar** and **Himanshu Sherje** , with a focus on real-world problem solving through technology. It serves as both a **technical prototype** and a **domain research initiative** into agricultural markets and contract farming workflows.

---

## 📜 License

This project is developed for **academic and educational purposes**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for Indian Farmers

⭐ Star this repo if you find it useful!

</div>
