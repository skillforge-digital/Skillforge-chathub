import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBackground, BackgroundType } from '../context/BackgroundContext';
import { Search, Image as ImageIcon, RotateCcw, MessageSquare } from 'lucide-react';
import ChatArea from '../components/ChatArea';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface ChatUser {
    id: string;
    name: string;
    hub: string | null;
    avatar: string | null;
}

const DirectMessages = () => {
    const { user } = useAuth();
    const { setCustomBackground } = useBackground();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);

    // Fetch all users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const users: ChatUser[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as ChatUser;
                    // doc.id is the UID, but let's check if the data has id. 
                    // Usually we store id in data too, or use doc.id.
                    // In AuthContext, we store user data with id: user.uid.
                    if (data.id !== user?.id) {
                        users.push(data);
                    }
                });
                setAllUsers(users);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, [user?.id]);

    // Listen for incoming DMs
    useEffect(() => {
        if (!user || !selectedUser) return;

        const conversationId = [user.id, selectedUser.id].sort().join('_');
        const q = query(collection(db, 'messages', 'dm', conversationId), orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [user, selectedUser]);

    // Handle user selection
    const handleSelectUser = (u: ChatUser) => {
        setSelectedUser(u);
        setMessages([]); 
    };

    const sendMessage = async (content: string, type: 'text' | 'image' | 'voice') => {
        if (!user || !selectedUser) return;
        
        const conversationId = [user.id, selectedUser.id].sort().join('_');

        // Note: In a real app, we should check/create the subcollection path if needed, 
        // but Firestore auto-creates collections when docs are added.
        // We are using a subcollection structure: messages/dm/{conversationId}/... 
        // Wait, earlier I used messages/general/chat.
        // Here I am using messages/dm/{conversationId}. 
        // Actually, Firestore structure should probably be:
        // collection('messages').doc('dm').collection(conversationId)
        // OR collection('direct_messages').doc(conversationId).collection('chat')
        // Let's stick to: collection(db, 'messages', 'dm', conversationId)
        // This means: collection 'messages', doc 'dm', subcollection 'conversationId'.
        // Wait, 'conversationId' is dynamic. 
        // If I use collection(db, 'messages', 'dm', conversationId), then 'dm' is the doc ID?
        // No. `collection(db, 'a', 'b', 'c')` -> collection 'a', doc 'b', collection 'c'.
        // So `messages` -> `dm` -> `conversationId`.
        // This implies `conversationId` is a COLLECTION.
        // And inside it are documents?
        // Yes, `addDoc` adds a document to that collection.
        // So structure: messages (col) -> dm (doc) -> CONVERSATION_ID (col) -> message (doc).
        
        await addDoc(collection(db, 'messages', 'dm', conversationId), {
            senderId: user.id,
            receiverId: selectedUser.id,
            senderName: user.name,
            content,
            type,
            timestamp: serverTimestamp(),
            scanned: false
        });
    };

    const wallpaperMenu = (
        <div className="relative">
            <button 
                onClick={() => setShowWallpaperMenu(!showWallpaperMenu)}
                className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
                title="Change Wallpaper"
            >
                <ImageIcon size={20} />
            </button>
            
            {showWallpaperMenu && (
                <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 p-2 glass-panel">
                    <p className="text-xs text-gray-400 mb-2 px-2">Select Wallpaper</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                        <button 
                            onClick={() => { setCustomBackground(null); setShowWallpaperMenu(false); }}
                            className="w-full text-left px-2 py-1.5 text-sm text-blue-400 hover:bg-white/5 rounded flex items-center"
                        >
                            <RotateCcw size={14} className="mr-2" />
                            <span>Auto (Daily)</span>
                        </button>
                        {['cosmic-void', 'earth-orbit', 'moon-surface', 'mars-colony', 'digital-grid', 'sun-dust', 'silver-dust'].map((bg) => (
                            <button
                                key={bg}
                                onClick={() => { setCustomBackground(bg as BackgroundType); setShowWallpaperMenu(false); }}
                                className="w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5 rounded capitalize"
                            >
                                {bg.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-full bg-transparent">
            {/* Sidebar List */}
            <div className="w-80 border-r border-white/10 flex flex-col glass-sidebar">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find people..." 
                            className="w-full bg-white/5 text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-600 placeholder-gray-400 border border-white/5"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {allUsers.map(u => {
                        return (
                            <div 
                                key={u.id}
                                onClick={() => handleSelectUser(u)}
                                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition ${selectedUser?.id === u.id ? 'bg-white/10 border-l-2 border-blue-500' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
                                    {u.avatar ? (
                                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                    ) : (
                                        u.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-200">{u.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                        {u.hub ? `${u.hub} Hub` : 'No Hub'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent relative z-10">
                {selectedUser ? (
                    <ChatArea 
                        roomName={selectedUser.name} 
                        messages={messages} 
                        onSendMessage={sendMessage}
                        allowMedia={true}
                        scanMedia={false}
                        headerRight={wallpaperMenu}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col glass-panel m-4 rounded-xl">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p className="text-lg">Select a user to start messaging</p>
                        <p className="text-sm opacity-60">Connections are open!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessages;
