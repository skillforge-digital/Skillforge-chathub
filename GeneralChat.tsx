import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatArea from '../components/ChatArea';
import axios from 'axios';

const GeneralChat = () => {
    const { user, updateUser } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [showHubModal, setShowHubModal] = useState(!user?.hub);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_room', 'general');

        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    const sendMessage = (content: string, type: 'text' | 'image' | 'voice') => {
        if (!socket || !user) return;
        
        socket.emit('send_message', {
            room: 'general',
            senderId: user.id,
            senderName: user.name,
            content,
            type
        });
    };

    const joinHub = async (hub: 'traders' | 'creative' | 'developers') => {
        try {
            await axios.post('/api/join-hub', { userId: user?.id, hub });
            updateUser({ hub });
            setShowHubModal(false);
            alert(`Welcome to the ${hub} Hub!`);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to join hub');
        }
    };

    return (
        <div className="relative h-full">
            <ChatArea 
                roomName="General Hub" 
                messages={messages} 
                onSendMessage={sendMessage}
                allowMedia={true}
                scanMedia={true} // Enable scanning for general chat
            />

            {showHubModal && !user?.hub && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="glass-panel p-8 rounded-xl max-w-2xl w-full mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Path</h2>
                        <p className="text-gray-300 text-center mb-8">
                            Select a specialized hub to join. <br/>
                            <span className="text-red-400 font-bold">Warning: You can only join ONE. The others will be locked forever.</span>
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => joinHub('traders')}
                                className="p-6 bg-green-900/30 border border-green-500/30 hover:bg-green-900/50 rounded-xl transition group"
                            >
                                <h3 className="text-xl font-bold text-green-400 mb-2">Traders Hope</h3>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300">For the market movers and shakers.</p>
                            </button>

                            <button 
                                onClick={() => joinHub('creative')}
                                className="p-6 bg-purple-900/30 border border-purple-500/30 hover:bg-purple-900/50 rounded-xl transition group"
                            >
                                <h3 className="text-xl font-bold text-purple-400 mb-2">Creative Hope</h3>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300">Designers, photographers, artists.</p>
                            </button>

                            <button 
                                onClick={() => joinHub('developers')}
                                className="p-6 bg-blue-900/30 border border-blue-500/30 hover:bg-blue-900/50 rounded-xl transition group"
                            >
                                <h3 className="text-xl font-bold text-blue-400 mb-2">Developer Home</h3>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300">Code, coffee, and collaboration.</p>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setShowHubModal(false)}
                            className="mt-6 w-full py-2 text-gray-400 hover:text-white text-sm"
                        >
                            I'll choose later
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralChat;
