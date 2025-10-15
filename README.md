# DevConnect

DevConnect is a full-stack social platform built with **Node.js, Express, MongoDB** for the backend and **Next.js + React** for the frontend. Users can register, log in, create posts, and manage their account settings. Admins have additional controls to manage users.


## 🚀 Features

### User
- Register and log in with JWT authentication
- Create, view, and delete own posts
- View all posts from all users
- Update account settings (theme, profile info, profile photo)
- Logout

### Admin
- View all registered users
- Block/unblock users
- Manage content (optional)

### General
- Responsive design with Tailwind CSS
- Real-time timestamps using `date-fns`
- Role-based access control
- Frontend & backend separated in one repository


## ⚡ Technologies

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Frontend:** Next.js, React, Tailwind CSS, date-fns
- **Dev Tools:** Nodemon, dotenv, express-validator

---

## 💾 Installation

### Backend

cd backend
npm install
cp .env.example .env
# update .env with your MongoDB URI and JWT secret
npm run dev


### Frontend

cd frontend
npm install
npm run dev
# App will be available at http://localhost:3000

### Create a .env file in backend with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

📝 Notes
This project is for learning purposes.
Make sure MongoDB is running locally or use a cloud MongoDB service.
Do not commit .env files containing secrets.
