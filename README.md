# InventoryFlow


Hosted Url := https://inventory-flow-six.vercel.app/login

A simple inventory management system built with React, Express, and Prisma.

1. Project Title
InventoryFlow – Product Library Management System
2. Problem Statement
Managing product items such as laptops, panels, car parts, or accessories becomes difficult
when done manually. “InventoryFlow” aims to simplify this process by providing a
centralized platform to manage all items — allowing users to add, update, delete, and track
inventory.
It can also calculate how many complete products can be built or shipped based on available
stock.
3. System Architecture
Architecture Flow:
Frontend (React.js) → Backend (Node.js + Express) → Database (MongoDB)
Stack Details:
• Frontend: React.js with React Router for navigation, Axios for API requests
• Backend: Node.js + Express.js for REST API
• Database: MongoDB (Non-relational)
• Authentication: JWT-based login/signup
• Hosting:
o Frontend: Vercel
o Backend: Render / Railway
o Database: MongoDB Atlas
4. Key Features
Category Features
Authentication &
Authorization
CRUD Operations Inventory Calculation User signup, login, logout using JWT; role-based access
(admin/user)
Create, Read, Update, Delete for product items
Automatically calculate how many complete products can be
made or shipped based on stock
Filtering, Searching &
Sorting
Pagination Search items by name, filter by category, and sort by
quantity/date
Paginated lists for large item collections
Category Features
Frontend Routing Hosting Pages: Home, Login, Dashboard, Items, Reports, Profile
Frontend (Vercel), Backend (Render/Railway), Database
(MongoDB Atlas)
5. Tech Stack
Layer Technologies
Frontend React.js, React Router, Axios, TailwindCSS
Backend Node.js, Express.js
Database MongoDB (MongoDB Atlas for hosting)
Authentication JWT (JSON Web Token)
Hosting Vercel (Frontend), Render/Railway (Backend), MongoDB Atlas (Database)
6. API Overview
Endpoint Method Description Access
/api/auth/signup POST Register new user Public
/api/auth/login POST Login user Public
/api/items GET Get all items Authenticated
/api/items POST Add new item Admin
/api/items/:id PUT Update item details Admin
/api/items/:id DELETE Delete item Admin
/api/inventory/calculate GET Calculate how many complete
products can be built Authenticated
7. Summary
InventoryFlow is a full-stack web application that allows businesses or teams to manage
their product libraries efficiently.
It includes user authentication, CRUD operations, search, filtering, pagination, and hosted
deployment — all built using modern technologies like React, Node.js, Express, and
MongoDB.