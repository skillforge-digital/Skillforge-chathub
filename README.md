# SkillForge ChatHub

A futuristic social platform featuring specialized hubs and immersive cosmic aesthetics.

## 🚀 Simple Version (HTML/JS)
The project has been simplified to run directly in the browser using Vanilla HTML, JavaScript, and Firebase CDN.

### **How to Run**
1. **Open `index.html`** in your browser.
   - You can just double-click the file!
   - Or use a simple server (e.g., Live Server in VS Code).

2. **Configure Firebase**
   - Open `app.js` in a text editor.
   - Find the `firebaseConfig` object at the top.
   - Replace the placeholder values with your actual Firebase Project keys.

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### **Features**
- **Authentication**: Sign up and Login using Firebase Auth.
- **Real-Time Chat**: Messages appear instantly via Firestore.
- **Hubs**: Switch between General, Traders, Creative, and Developers hubs.
- **Glassmorphism UI**: Beautiful transparent interface using Tailwind CSS.

---

## Legacy React Version
The original React version is located in the `legacy_react_client` folder if you wish to use the full framework capabilities later.
