# SkillForge ChatHub

A social chat ecosystem featuring specialized hubs and connection-based direct messaging.

## Features

- **Authentication**: Sign up and Login.
- **General Hub**: Open chat for everyone. Photos are automatically "scanned" (mocked) for safety.
- **Specialized Hubs**: Join one exclusive hub (Traders Hope, Creative Hope, or Developer Home). Once joined, others are locked.
- **Direct Messages**: 
  - Connect with other users.
  - "3-Message Rule": You can only send 3 messages to a new connection until they accept.
  - Share photos and voice notes (unscanned in DMs).
- **Profile**: Set your bio, upload a profile picture, and view connection stats.

## Prerequisites

- Node.js installed on your machine.

## Setup Instructions

### 1. Setup Backend (Server)

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001`.

### 2. Setup Frontend (Client)

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The client will usually run on `http://localhost:5173`.

## Usage

1. Open the client URL in your browser.
2. Sign up for a new account.
3. You will be placed in the **General Hub**.
4. You can choose to join a specific hub (Traders, Creative, or Developers) via the popup or sidebar.
5. Go to **Messages** to find other users and start chatting.
6. Go to **Profile** to update your avatar and bio.
