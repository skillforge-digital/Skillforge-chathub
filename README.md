# SkillForge ChatHub

A futuristic social platform featuring specialized hubs, connection-based messaging, and immersive cosmic aesthetics.

![SkillForge ChatHub](https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop)

## 🌌 Features

### **Immersive Experience**
- **Dynamic Backgrounds**: Automatically rotates daily (Cosmic Void, Earth Orbit, Moon Surface, Mars Colony, Digital Grid, Sun Dust, Silver Dust).
- **Glassmorphism UI**: Modern, translucent interface designed for readability against complex space backdrops.
- **Custom Wallpapers**: Users can override the daily background in **Direct Messages** to set their own mood.

### **Hub System**
- **General Hub**: Open comms for all users. Media uploads are scanned for safety.
- **Specialized Hubs**: Choose your path (Traders Hope, Creative Hope, or Developer Home). *Warning: Choosing one locks the others forever.*

### **Direct Messaging**
- **Connection-Based**: Send requests to start chatting.
- **3-Message Rule**: New connections are limited to 3 messages until the recipient accepts.
- **Unrestricted Media**: Share photos and voice notes freely in private chats.

### **Profile**
- Custom Avatars and Bio.
- Connection stats tracking.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/skillforge-chathub.git
    cd skillforge-chathub
    ```

2.  **Setup Server**
    ```bash
    cd server
    npm install
    npm start
    ```
    Server runs on `http://localhost:3001`

3.  **Setup Client**
    Open a new terminal:
    ```bash
    cd client
    npm install
    npm run dev
    ```
    Client runs on `http://localhost:5173`

## 📂 Project Structure

```
skillforge-chathub/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (ChatArea, Sidebar...)
│   │   ├── context/        # State (Auth, Socket, Backgrounds)
│   │   ├── pages/          # Routes (Login, DMs, Hubs)
│   └── ...
├── server/                 # Node.js Backend
│   ├── server.js           # Main Express/Socket.io app
│   └── uploads/            # Media storage (git-ignored)
└── README.md
```

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.io
- **State Management**: React Context API
- **Design**: Glassmorphism, CSS Animations

## 📝 License
This project is open source.
