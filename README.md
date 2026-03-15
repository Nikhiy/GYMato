# DineFlow

A **microservices-based food delivery platform** inspired by Zomato/Swiggy.
The system supports **user ordering, restaurant management, rider delivery, real-time tracking, and payment processing** using an event-driven architecture.

---

# 📌 Overview

GYMato is a **scalable food delivery system** built using **Node.js microservices**, **RabbitMQ messaging**, **Socket.IO real-time updates**, and **Docker containerization**.

The system is designed to simulate how real-world food delivery platforms operate by separating responsibilities across independent services.

Key highlights:

* Microservices architecture
* Event-driven communication using RabbitMQ
* Real-time order updates using Socket.IO
* Secure authentication using JWT
* Payment integration using Razorpay
* Dockerized services
* Cloud-hosted message broker (AWS RabbitMQ)

---

# 🏗 System Architecture

The platform follows a **microservices architecture** where each service is responsible for a specific domain.

```
Frontend (React + Vite)
        │
        ▼
   API Requests
        │
        ▼
------------------------------------------------
Auth Service
Admin Service
Restaurant Service
Rider Service
Payment Service
Realtime Service
------------------------------------------------
        │
        ▼
RabbitMQ Message Broker (AWS Hosted)
        │
        ▼
MongoDB Database
```

Two communication methods are used:

### 1️⃣ Synchronous Communication

HTTP REST APIs between the frontend and backend services.

Example:

```
Frontend → Auth Service
Frontend → Restaurant Service
Frontend → Rider Service
```

### 2️⃣ Asynchronous Communication

Event-driven communication using RabbitMQ.

Example:

```
Restaurant Service
      │
      ▼
Publish "orderReady" event
      │
      ▼
RabbitMQ
      │
      ▼
Rider Service consumes event
```

---

# 🧩 Microservices

## 1️⃣ Auth Service

Handles user authentication and authorization.

Features:

* User registration
* Login
* Google OAuth login
* JWT authentication
* Auth middleware

Structure:

```
auth
 ├ config
 ├ controllers
 ├ middleware
 ├ models
 └ routes
```

---

## 2️⃣ Admin Service

Handles administrative operations.

Features:

* Manage restaurants
* Add or remove menu items
* Manage restaurant listings

---

## 3️⃣ Restaurant Service

Core service responsible for restaurant operations.

Features:

* Restaurant management
* Menu management
* Cart operations
* Order creation
* Order event publishing

Events published to RabbitMQ:

```
order_created
order_ready
```

---

## 4️⃣ Rider Service

Handles delivery partner operations.

Features:

* Rider authentication
* Rider dashboard
* Accept delivery requests
* Receive events from RabbitMQ when orders are ready

Event consumed:

```
orderReady
```

---

## 5️⃣ Realtime Service

Handles real-time communication between backend and frontend.

Implemented using **Socket.IO**.

Features:

* Live order tracking
* Rider location updates
* Order status notifications

---

## 6️⃣ Payment Service

Handles payment processing.

Features:

* Razorpay order creation
* Payment verification
* Payment event publishing

Workflow:

```
Checkout
   ↓
Create Razorpay order
   ↓
User completes payment
   ↓
Verify payment signature
   ↓
Publish payment success event
```

---

# 💻 Frontend

Built with:

* React
* TypeScript
* Vite

Structure:

```
frontend
 ├ components
 ├ pages
 ├ context
 ├ utils
 └ assets
```

Important pages:

User pages

```
Home
RestaurantPage
Cart
Checkout
Orders
Account
```

Admin pages

```
Admin Dashboard
Add Restaurant
Add Menu Item
```

Rider pages

```
Rider Dashboard
Current Orders
Delivery Map
```

---

# ⚡ Real-time Order Updates

The system uses **Socket.IO** to push updates to the client.

Example flow:

```
Restaurant prepares order
       ↓
RabbitMQ event
       ↓
Realtime Service
       ↓
Socket.IO emits event
       ↓
Frontend receives update
```

---

# 💳 Payment Integration

Payments are handled using **Razorpay**.

Steps:

```
User places order
     ↓
Create Razorpay order
     ↓
User completes payment
     ↓
Verify payment signature
     ↓
Order confirmed
```

---

# 🐳 Docker Setup

Each service runs inside its own container.

Services include:

```
auth
admin
restaurant
rider
realtime
utils
frontend
```

Every service contains a `Dockerfile` to build its container.

Example:

```
auth/Dockerfile
restaurant/Dockerfile
rider/Dockerfile
realtime/Dockerfile
utils/Dockerfile
```

---

# ☁️ Cloud Infrastructure

* RabbitMQ hosted on **AWS**
* Dockerized microservices
* Event-driven service communication

---

# 📦 Tech Stack

Frontend

* React
* TypeScript
* Vite

Backend

* Node.js
* Express.js
* TypeScript

Database

* MongoDB

Messaging

* RabbitMQ

Realtime Communication

* Socket.IO

Payments

* Razorpay

Cloud

* AWS (RabbitMQ hosting)

Containerization

* Docker

Media Storage

* Cloudinary

---

# 🚀 Installation

Clone the repository

```
git clone https://github.com/Nikhiy/GYMato.git
```

Install dependencies

```
npm install
```

Run services

```
npm run dev
```

Or using Docker

```
docker build .
docker run
```

---

# 📊 Order Flow

```
User selects food
      ↓
Add items to cart
      ↓
Checkout
      ↓
Razorpay payment
      ↓
Payment verified
      ↓
Order created
      ↓
Restaurant prepares order
      ↓
RabbitMQ event (orderReady)
      ↓
Rider service receives event
      ↓
Rider assigned
      ↓
Realtime service updates frontend
      ↓
Order delivered
```

---

# 🎯 Key Features

* Microservices architecture
* Event-driven system using RabbitMQ
* Real-time order updates
* Role-based access (User / Admin / Rider)
* Secure authentication
* Payment gateway integration
* Dockerized services
* Cloud messaging infrastructure

---

# 📈 Future Improvements

* API Gateway implementation
* Redis caching
* Kubernetes deployment
* Rate limiting
* Service discovery
* Load balancing

---

# 👨‍💻 Author

**Nikhil Y**

GitHub:
https://github.com/Nikhiy

---
