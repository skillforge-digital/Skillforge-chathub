// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized");
} catch (e) {
    console.error("Firebase Initialization Error. Did you update the config in app.js?", e);
    alert("Please update app.js with your Firebase Config!");
}

const auth = firebase.auth();
const db = firebase.firestore();

// State
let currentUser = null;
let currentUnsubscribe = null;
let currentHub = 'general';

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');
const userNameDisplay = document.getElementById('user-name');
const userAvatarDisplay = document.getElementById('user-avatar');

// --- Auth Functions ---

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", user.email);
        
        // Fetch extra user data (name)
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                userNameDisplay.textContent = data.name || user.email;
                userAvatarDisplay.textContent = (data.name || user.email)[0].toUpperCase();
            } else {
                userNameDisplay.textContent = user.email;
            }
        });

        showApp();
    } else {
        currentUser = null;
        console.log("User logged out");
        showAuth();
    }
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        });
});

// Signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;
    const errorDiv = document.getElementById('signup-error');

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Create user profile
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                hub: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .catch((error) => {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        });
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Toggle Forms
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// --- UI Logic ---

function showApp() {
    authScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    loadChat(currentHub);
}

function showAuth() {
    authScreen.style.display = 'flex';
    appScreen.style.display = 'none';
    if (currentUnsubscribe) currentUnsubscribe();
}

// --- Chat Logic ---

function switchHub(hubId) {
    if (hubId === currentHub) return;
    currentHub = hubId;
    
    // Update UI active state
    document.getElementById('current-room-name').textContent = hubId.charAt(0).toUpperCase() + hubId.slice(1) + (hubId === 'developers' ? ' Home' : ' Hub');
    
    loadChat(hubId);
}

function loadChat(hubId) {
    // Unsubscribe from previous listener
    if (currentUnsubscribe) currentUnsubscribe();
    
    messagesContainer.innerHTML = ''; // Clear old messages

    // Listen to new query
    // Structure: messages/{hubId}/chat
    // If you used 'messages/general/chat' in React app, keep it consistent.
    // Actually, in React app we used `collection(db, 'messages', hubId, 'chat')`
    
    const query = db.collection('messages').doc(hubId).collection('chat').orderBy('timestamp', 'asc').limit(50);
    
    currentUnsubscribe = query.onSnapshot((snapshot) => {
        // Simple diffing could be better, but clearing is safer for simple JS
        // Or we can just append new ones?
        // Let's just append new ones if we track IDs, but simpler to rebuild for MVP or just append.
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                renderMessage(change.doc.data(), change.doc.id);
            }
        });
        
        scrollToBottom();
    });
}

function renderMessage(data, id) {
    const isMe = data.senderId === currentUser.uid;
    const div = document.createElement('div');
    div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`;
    div.id = `msg-${id}`;
    
    let contentHtml = '';
    if (data.type === 'text') {
        contentHtml = `<p>${escapeHtml(data.content)}</p>`;
    } else if (data.type === 'image') {
        contentHtml = `<img src="${data.content}" class="rounded-lg max-h-60 border border-white/10">`;
    }

    const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...';

    div.innerHTML = `
        <div class="max-w-[70%] p-3 rounded-2xl backdrop-blur-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800/80 text-gray-200 border border-white/5 rounded-tl-none'} shadow-lg">
            ${!isMe ? `<p class="text-xs text-blue-300 mb-1 font-bold">${escapeHtml(data.senderName)}</p>` : ''}
            ${contentHtml}
            <span class="text-[10px] opacity-60 block text-right mt-1">${time}</span>
        </div>
    `;
    
    messagesContainer.appendChild(div);
}

// Send Message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;

    db.collection('messages').doc(currentHub).collection('chat').add({
        content: content,
        senderId: currentUser.uid,
        senderName: userNameDisplay.textContent,
        type: 'text',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        scanned: true // Assume scanned for general hub
    });

    messageInput.value = '';
});

// Utils
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Background Rotation (Simple)
const backgrounds = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Cosmic
    'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop', // Earth
    'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=1973&auto=format&fit=crop'  // Moon
];
const day = new Date().getDay();
document.getElementById('bg-image').src = backgrounds[day % backgrounds.length];

// Make functions global for HTML onClick handlers
window.switchHub = switchHub;
