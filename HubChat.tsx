import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatArea from '../components/ChatArea';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const HubChat = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const { user } = useAuth();
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
        if (!hubId) return;

        const q = query(collection(db, 'messages', hubId, 'chat'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [hubId]);

    const sendMessage = async (content: string, type: 'text' | 'image' | 'voice') => {
        if (!user || !hubId) return;
        
        await addDoc(collection(db, 'messages', hubId, 'chat'), {
            senderId: user.id,
            senderName: user.name,
            content,
            type,
            timestamp: serverTimestamp()
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
