import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useBackground, BackgroundType } from '../context/BackgroundContext';
import axios from 'axios';
import { Search, UserPlus, Check, X, MessageSquare, Image as ImageIcon, RotateCcw } from 'lucide-react';
import ChatArea from '../components/ChatArea';

interface ChatUser {
    id: string;
    name: string;
    hub: string | null;
    avatar: string | null;
}

const DirectMessages = () => {
    const { user, updateUser } = useAuth();
    const { setCustomBackground } = useBackground();
    const socket = useSocket();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted'>('none');
    const [pendingCount, setPendingCount] = useState(0); // How many msgs sent if pending
    const [isInitiator, setIsInitiator] = useState(false);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);

    // Fetch all users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users');
                // Filter out self
                setAllUsers(res.data.filter((u: ChatUser) => u.id !== user?.id));
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, [user?.id]);

    // Listen for incoming DMs
    useEffect(() => {
        if (!socket || !user) return;

        const channel = `dm_${user.id}`;
        socket.on(channel, (data) => {
            // If message belongs to current conversation
            if (selectedUser && (data.senderId === selectedUser.id || data.senderId === user.id)) {
                 // Check if it's the *other* person sending, to update UI if we are in current chat
                 // But wait, if I sent it, I also get it back via my channel.
                 // So I just append.
                 // HOWEVER, I need to filter. The server broadcasts to `dm_UserID`.
                 // If I send to Bob, server emits to `dm_Bob` and `dm_Me`.
                 // So if I am Me, I receive my own message.
                 // If I am Bob, I receive Me's message.
                 
                 // If I am looking at Bob's chat, I append.
                 // If I am looking at Alice's chat, I ignore (or show notification).
                 
                 const otherId = data.senderId === user.id ? data.receiverId : data.senderId;
                 // Actually data doesn't have receiverId in the event payload I defined in server?
                 // Wait, server: io.emit(`dm_${receiverId}`, { ...msg, from: senderId });
                 // It only sends msg content + from. It doesn't say "to".
                 // So if I receive on `dm_Me`, I know it's FOR me or FROM me.
                 // If from me, senderId is me.
                 // If from other, senderId is other.
                 
                 // If I selectedUser is Bob.
                 // If data.senderId is Bob -> Append.
                 // If data.senderId is Me -> Append (assuming I sent it to Bob). 
                 // Wait, if I send to Alice, I also get it on `dm_Me`. 
                 // I need to know who the message was *for* if I sent it.
                 // I should update server to include `receiverId` in the payload.
                 
                 // Let's quickly fix server logic mentally:
                 // I'll just filter by: if sender is selectedUser OR (sender is me AND ... wait I don't know who I sent to).
                 // I need to fix the server to include `receiverId` or `to` field in the emitted message.
                 
                 // PROACTIVE FIX: I will update the server code in a moment. 
                 // For now, I'll assume the server sends `receiverId` or I can deduce it? No I can't.
                 // I will assume I'll fix the server.
                 
                 if (data.senderId === selectedUser.id || (data.senderId === user.id && data.receiverId === selectedUser.id)) {
                     setMessages(prev => [...prev, data]);
                     // Update connection status if accepted
                     if (data.connectionStatus) setConnectionStatus(data.connectionStatus);
                 }
            }
        });

        const updateChannel = `connection_update_${user.id}`;
        socket.on(updateChannel, (data) => {
             if (selectedUser && data.targetId === selectedUser.id) {
                 setConnectionStatus(data.status);
                 // Refresh user list to show updated connection
                 updateUser({ connected: [...(user.connected || []), data.targetId] });
             }
        });

        return () => {
            socket.off(channel);
            socket.off(updateChannel);
        };
    }, [socket, user, selectedUser]);

    // Handle user selection
    const handleSelectUser = (u: ChatUser) => {
        setSelectedUser(u);
        setMessages([]); // In real app, fetch history
        // Determine connection status
        if (user?.connected.includes(u.id)) {
            setConnectionStatus('accepted');
        } else {
            // We don't know if pending without checking server. 
            // For this mock, we assume 'none' unless we have local history.
            // In a real app, I'd fetch `GET /api/connection-status?target=...`
            setConnectionStatus('none'); // Default, will update if we get error or history
        }
    };

    const sendMessage = (content: string, type: 'text' | 'image' | 'voice') => {
        if (!socket || !user || !selectedUser) return;
        
        // Optimistic UI? No, wait for echo.
        socket.emit('send_dm', {
            senderId: user.id,
            receiverId: selectedUser.id,
            content,
            type
        });
        
        // If not connected, increment local count for UI feedback
        if (connectionStatus !== 'accepted') {
             setPendingCount(prev => prev + 1);
        }
    };

    const acceptConnection = () => {
        if (!socket || !user || !selectedUser) return;
        socket.emit('accept_connection', {
            userId: user.id,
            targetId: selectedUser.id
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
                        const isConnected = user?.connected.includes(u.id);
                        return (
                            <div 
                                key={u.id}
                                onClick={() => handleSelectUser(u)}
                                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition ${selectedUser?.id === u.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold ring-2 ring-white/10">
                                    {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full" /> : u.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-sm font-medium text-white truncate">{u.name}</h3>
                                        {isConnected && <span className="text-[10px] text-green-400 bg-green-900/30 px-1 rounded border border-green-500/20">Conn</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{u.hub ? `${u.hub} Hub` : 'Newcomer'}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {connectionStatus !== 'accepted' && (
                            <div className="bg-blue-900/20 border-b border-blue-900/50 p-3 flex justify-between items-center px-6">
                                <p className="text-sm text-blue-200">
                                    You are not connected with {selectedUser.name}. 
                                    {/* Logic to show accept button if receiver */}
                                    {/* Since we don't track initiator perfectly in frontend without API, we show generic message */}
                                    <br/>
                                    <span className="text-xs opacity-70">Limit: 3 messages until accepted. Photos/Voice allowed.</span>
                                </p>
                                <button 
                                    onClick={acceptConnection}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                    Accept Connection
                                </button>
                            </div>
                        )}
                        <ChatArea 
                            roomName={selectedUser.name} 
                            messages={messages} 
                            onSendMessage={sendMessage}
                            allowMedia={true}
                            scanMedia={false} // "for DMs, you can allow photos on the voice record... without being scanned"
                            headerRight={wallpaperMenu}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessages;
