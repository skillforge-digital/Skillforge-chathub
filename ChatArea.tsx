import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Message {
    id: string;
    senderId: string;
    senderName?: string;
    content: string;
    type: 'text' | 'image' | 'voice';
    timestamp: any; // Firestore timestamp or number
    scanned?: boolean;
}

interface ChatAreaProps {
    roomName: string;
    messages: Message[];
    onSendMessage: (content: string, type: 'text' | 'image' | 'voice') => void;
    allowMedia: boolean;
    scanMedia?: boolean; // If true, show scanning state
    headerRight?: React.ReactNode;
}

const ChatArea: React.FC<ChatAreaProps> = ({ roomName, messages, onSendMessage, allowMedia, scanMedia, headerRight }) => {
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input, 'text');
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            
            try {
                // Upload to Firebase Storage
                const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                
                // In a real app with scanning, we'd trigger a cloud function here
                onSendMessage(url, 'image');
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="p-4 border-b border-white/10 glass-panel flex justify-between items-center">
                <h2 className="text-xl font-bold text-white capitalize">{roomName}</h2>
                {headerRight}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const timeString = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : new Date(msg.timestamp).toLocaleTimeString();
                    
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg backdrop-blur-sm ${isMe ? 'bg-blue-600/90 text-white' : 'bg-gray-800/80 text-gray-200 border border-white/5'}`}>
                                {!isMe && msg.senderName && <p className="text-xs text-blue-300 mb-1">{msg.senderName}</p>}
                                
                                {msg.type === 'text' && <p>{msg.content}</p>}
                                
                                {msg.type === 'image' && (
                                    <div className="relative">
                                        <img src={msg.content} alt="Shared" className="rounded max-h-60" />
                                        {scanMedia && <span className="absolute bottom-1 right-1 bg-green-500 text-xs px-1 rounded text-white">Scanned</span>}
                                    </div>
                                )}

                                {msg.type === 'voice' && (
                                    <div className="flex items-center space-x-2">
                                        <Mic size={16} />
                                        <span>Voice Note (Mock)</span>
                                    </div>
                                )}
                                
                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {timeString}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 glass-panel">
                <div className="flex items-center space-x-2">
                    {allowMedia && (
                        <>
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 text-gray-400 hover:text-white transition"
                                title="Send Image"
                            >
                                <ImageIcon size={20} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                            
                            {!scanMedia && ( // Voice notes only allowed in DMs (where scanMedia is false)
                                <button 
                                    className="p-2 text-gray-400 hover:text-white transition"
                                    onClick={() => onSendMessage("Voice Note Mock Content", 'voice')}
                                    title="Send Voice Note"
                                >
                                    <Mic size={20} />
                                </button>
                            )}
                        </>
                    )}
                    
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 glass-input text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
                    />
                    
                    <button 
                        onClick={handleSend} 
                        disabled={!input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {isUploading && <p className="text-xs text-blue-400 mt-2">Uploading & Scanning...</p>}
            </div>
        </div>
    );
};

export default ChatArea;
