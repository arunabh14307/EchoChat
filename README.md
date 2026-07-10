# EchoChat 💬

A production-ready, real-time messaging application built with React, Node.js, MongoDB, and Socket.io.

![EchoChat](https://img.shields.io/badge/EchoChat-v1.0.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io)

---

## ✨ Features

- 🔐 **JWT Authentication** — Access + Refresh token strategy with httpOnly cookies
- 💬 **Real-time Messaging** — Powered by Socket.io with room-based architecture
- 👥 **Group Chats** — Create groups, manage members
- 🟢 **Presence System** — Online/offline status and last seen
- ✏️ **Typing Indicators** — Real-time typing feedback
- ✅ **Read Receipts** — Message delivery and read status
- 📎 **Media Uploads** — Images & files via Cloudinary
- 😄 **Emoji Picker** — Full emoji support in messages
- 🔍 **User Search** — Find and start chats with anyone
- 🌙 **Dark Theme** — Beautiful dark UI with Tailwind CSS
- 📱 **Responsive** — Fully responsive across all devices

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3 |
| **State** | Zustand |
| **Real-time** | Socket.io |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (Access + Refresh Tokens) |
| **Uploads** | Multer + Cloudinary |
| **Validation** | Zod |

---

## 📁 Project Structure

```
EchoChat/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level pages
│       ├── hooks/         # Custom React hooks
│       ├── store/         # Zustand state slices
│       ├── services/      # API layer (Axios)
│       └── utils/         # Pure utility functions
│
└── server/          # Node.js + Express backend
    └── src/
        ├── api/           # Feature modules (routes/controller/service)
        ├── models/        # Mongoose schemas
        ├── socket/        # Socket.io handlers
        ├── middleware/    # Express middleware
        ├── config/        # App configuration
        └── utils/         # Server utilities
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm >= 9.0.0

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/echochat.git
cd echochat
```

### 2. Set up environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your values

# Client
cp client/.env.example client/.env
# Edit client/.env with your values
```

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Start development servers

```bash
npm run dev
```

This starts:
- **Client** on `http://localhost:5173`
- **Server** on `http://localhost:5000`

---

## 🔧 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/echochat` |
| `JWT_ACCESS_SECRET` | Access token secret | `your_secret_here` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your_refresh_secret_here` |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both client & server in development |
| `npm run dev:client` | Start only the client |
| `npm run dev:server` | Start only the server |
| `npm run build` | Build client for production |
| `npm run start` | Start server in production mode |
| `npm run install:all` | Install all dependencies |
| `npm run lint` | Lint all code |

---

## 🏛️ Architecture

### Clean Architecture (Server)
Each feature (`auth`, `users`, `conversations`, `messages`) follows the pattern:
```
routes → controller → service → model
```

### Token Strategy
- **Access Token** — 15 min, stored in memory (Zustand)
- **Refresh Token** — 7 days, stored in httpOnly cookie
- Axios interceptor silently refreshes expired access tokens

### Real-time Design
- Rooms keyed by `conversationId`
- Presence tracked server-side in a `Map`
- All socket events authenticated via JWT middleware

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Built with ❤️ using React & Node.js</p>
