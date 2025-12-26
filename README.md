# 🛍️ StyleNest

**StyleNest** is a full-stack e-commerce web application for online clothing retail, featuring products for **Men, Women, and Kids**. The platform provides a secure, scalable, and user-friendly shopping experience with real-world e-commerce functionalities.

This project was built using the **MERN stack** and containerized with **Docker** as part of the **CBA Apprenticeship Final Project**.

---

## 🚀 Features

### 👤 User Features

* User Signup & Login
* Forgot Password with email-based reset link
* Browse products across Men, Women, and Kids categories
* Add / Remove products from Cart
* **Persistent Cart** (cart remains even after logout & login)
* Add / Remove products from Wishlist
* Promo Code integration for discounts
* Secure Checkout using **Razorpay**
* Order success notification
* View all orders in **My Orders** section
* Download invoice (PDF)
* Invoice automatically sent to registered email
* Dark / Light mode toggle
* Fully mobile-responsive UI
* Integrated chatbot with minimal assistance features

---

### 🛠️ Admin Features

* Admin authentication
* View list of all products
* Add new products
* Manage product inventory
* View analytics and reports
* Monitor orders and order lifecycle

---

## 🧰 Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* React Router
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### Payments & Services

* Razorpay Payment Gateway
* Email service (Invoices & Password Reset)

### DevOps & Deployment

* Docker & Docker Compose
* Backend hosted on **Render**
* Frontend hosted on **Netlify**

---

## 🗂️ Project Flow

1. User signs up or logs in
2. User browses products (Men / Women / Kids)
3. Products added to Cart or Wishlist
4. Cart total calculated dynamically
5. Promo code applied (optional)
6. User proceeds to checkout
7. Redirected to Razorpay payment gateway
8. On successful payment:

   * Order is created
   * Cart is emptied
   * Invoice is generated
   * Invoice sent via email
9. User can view orders and download invoices anytime

---

## 🗄️ Database Structure

### Collections

* **Users** – authentication details, cart, wishlist
* **Products** – product details, pricing, categories
* **Orders** – order items, payment status, invoices

---

## 🐳 Docker Containerization

* Entire application is containerized using Docker
* Separate containers for:

  * Frontend
  * Backend
  * Admin Panel
* Managed using `docker-compose.yml`
* Ensures consistent development and deployment environments

---

## 🌐 Deployment

* **Frontend**: Netlify
* **Backend**: Render

---

## 📦 Installation & Setup

### Prerequisites

* Node.js
* Docker & Docker Compose
* MongoDB (local or cloud)

### Clone the Repository

```bash
git clone <repository-url>
cd stylenest
```

### Run with Docker

```bash
docker-compose up --build
```

### Run Without Docker

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📈 Learning Outcomes

* Full-stack MERN application development
* Secure authentication and payment integration
* Real-world e-commerce workflows
* Docker-based containerization
* Team collaboration using Git

---

## 📌 Conclusion

StyleNest is a complete, production-ready e-commerce solution that demonstrates modern web development practices, secure online transactions, scalable architecture, and user-centric design.

---

⭐ *If you find this project useful, feel free to star the repository!*
