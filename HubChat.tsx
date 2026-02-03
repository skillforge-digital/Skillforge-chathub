import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatArea from '../components/ChatArea';

const HubChat = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState<any[]>([]);

    // Security check: If user tries to access a hub they don't belong to
    if (user?.hub && user.hub !== hubId) {
        return <Navigate to="/general" />;
    }

    // If user hasn't chosen a hub yet, they shouldn't be here (or maybe they can preview? No, locked).
    if (!user?.hub) {
        return <Navigate to="/general" />;
    }

    useEffect(() => {
        if (!socket || !hubId) return;

        socket.emit('join_room', hubId);
        setMessages([]); // Clear previous room messages

        const handleMsg = (data: any) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on('receive_message', handleMsg);

        return () => {
            socket.off('receive_message', handleMsg);
        };
    }, [socket, hubId]);

    const sendMessage = (content: string, type: 'text' | 'image' | 'voice') => {
        if (!socket || !user || !hubId) return;
        
        socket.emit('send_message', {
            room: hubId,
            senderId: user.id,
            senderName: user.name,
            content,
            type
        });
    };

    return (
        <ChatArea 
            roomName={`${hubId} Hub`} 
            messages={messages} 
            onSendMessage={sendMessage}
            allowMedia={true}
            scanMedia={false} // No scanning in specialized hubs? Or maybe needed? 
            // User only mentioned scanning in General. I'll disable it here for now.
        />
    );
};

export default HubChat;
