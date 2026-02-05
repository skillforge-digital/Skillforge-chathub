# SkillForge ChatHub

A futuristic social platform featuring specialized hubs, connection-based messaging, and immersive cosmic aesthetics. Now powered by **Firebase** for real-time chat, authentication, and data storage.

![SkillForge ChatHub](https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop)

## 🌌 Features

### **Immersive Experience**
- **Dynamic Backgrounds**: Automatically rotates daily (Cosmic Void, Earth Orbit, Moon Surface, Mars Colony, Digital Grid, Sun Dust, Silver Dust).
- **Glassmorphism UI**: Modern, translucent interface designed for readability against complex space backdrops.
- **Custom Wallpapers**: Users can override the daily background in **Direct Messages** to set their own mood.

### **Hub System**
- **General Hub**: Open comms for all users.
- **Specialized Hubs**: Choose your path (Traders Hope, Creative Hope, or Developer Home). *Warning: Choosing one locks the others forever.*

### **Direct Messaging**
- **Real-Time Chat**: Powered by Firestore.
- **Connection-Based**: Send requests to start chatting.
- **Media Sharing**: Share images via Firebase Storage.

### **Profile**
- Custom Avatars and Bio.
- Connection stats tracking.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- A Firebase Project (Free Tier)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/skillforge-chathub.git
    cd skillforge-chathub
    ```

2.  **Install Dependencies**
    ```bash
    npm run install-all
    ```
    Or manually:
    ```bash
    cd client
    npm install
    ```

3.  **Firebase Configuration**
    - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - Enable **Authentication** (Email/Password provider).
    - Enable **Firestore Database** (Start in Test Mode).
    - Enable **Storage** (Start in Test Mode).
    - Go to Project Settings -> General -> Your apps -> Add App (Web).
    - Copy the `firebaseConfig` object.
    - Open `client/src/firebase.ts` and replace the placeholder values with your actual config:
      ```typescript
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };
      ```

4.  **Run the Client**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:5173`.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel ready (static site)

## 📝 License
MIT
