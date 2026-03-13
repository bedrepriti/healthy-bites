# 🥗 Healthy Bites — Full-Stack Food Ordering Platform

Healthy Bites is a production-ready full-stack food ordering web application built using React, Node.js, Express, and MySQL.  
It simulates a real-world food-tech platform (Swiggy / Zomato style) and demonstrates practical engineering skills including state management, image handling, performance optimization, and admin workflows.

## 🔍 Why This Project Matters

This is not a tutorial or demo app.  
It mirrors how real food-delivery platforms work, focusing on:

- Scalable frontend architecture
- Clean REST-based API design
- Database-driven UI
- Real customer and admin workflows
- Performance and UX optimization

## 🧩 Key Features

### Customer Side
- Category-based product listing
- Skeleton loaders for slow networks
- Add-to-cart with dynamic quantity controls
- Cart persistence using Context API
- Toast notifications for UX feedback
- Stock-based Sold Out handling
- Fully responsive, mobile-first UI

### Cart & Order Flow
- Centralized cart state management
- Increment / decrement quantity logic
- Automatic price calculation (subtotal, delivery, total)
- Ready for payment gateway integration

### Admin Panel
- Secure admin access (key-based)
- Product CRUD (Add / Edit / Delete)
- Image upload support
- Inventory and stock control
- Order visibility and management

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Context API
- Modular component architecture
- Custom skeleton loaders
- Lazy-loaded images
- Clean CSS (no UI frameworks)

### Backend
- Node.js
- Express.js
- REST-based API architecture
- Image upload handling (Multer, Cloudinary-ready)

### Database
- MySQL
- Relational schema for products and orders

## 🧠 Engineering Highlights

- Fixed image loss on server restarts using absolute image URLs
- Improved perceived performance with skeleton loaders
- Built reusable cart logic inspired by real food-delivery apps
- Graceful handling of slow API responses
- Clean separation of UI, logic, API, and database layers

## 📁 Architecture Overview
├─ Pages (Menu, Cart, Checkout, Admin)
├─ Components (Navbar, Cards, Loaders)
├─ Context (Cart State)
└─ Utils (API helpers)

Backend (Node + Express)
├─ Routes
├─ Controllers
├─ Database Connection
└─ Image Handling

## ⚙️ Local Setup

Backend -
cd server
npm install
npm run dev

Frontend -
cd client
npm install
npm run dev

## 🚀 Deployment

- Frontend: Netlify / Vercel
- Backend: Render (free tier tested)
- Database: MySQL

## 🎯 What This Project Demonstrates

- Full-stack development capability
- Real-world problem-solving skills
- UX and performance awareness
- Production-level architectural thinking
- Clean, maintainable code

## 👤 Author

Priti Nandkumar Bedre  
Frontend Developer (React)

GitHub: https://github.com/bedrepriti

## ⭐ Recruiter Note

This project reflects how I build real applications, not demos.  
My focus is on usability, performance, and clean architecture.

