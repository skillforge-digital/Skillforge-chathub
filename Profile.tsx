import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [bio, setBio] = useState(user?.bio || '');
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSaveBio = async () => {
        if (!user) return;
        try {
            await updateUser({ bio });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update bio");
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            setUploading(true);
            const file = e.target.files[0];
            
            try {
                // Upload to Firebase Storage
                const storageRef = ref(storage, `avatars/${user.id}-${Date.now()}`);
                await uploadBytes(storageRef, file);
                const avatarUrl = await getDownloadURL(storageRef);
                
                // Update user profile
                await updateUser({ avatar: avatarUrl });
                alert("Profile picture updated");
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed");
            } finally {
                setUploading(false);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

            <div className="bg-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                
                {/* Avatar Section */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden border-4 border-gray-600">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500 font-bold">
                                {user.name[0]}
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
                        <Camera size={16} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                    {uploading && <p className="text-xs text-blue-400 mt-2 text-center">Uploading...</p>}
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-6 w-full">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <p className="text-blue-400 text-sm font-medium uppercase tracking-wide">
                            {user.hub ? `${user.hub} Hub` : 'No Hub Joined'}
                        </p>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center space-x-4">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">{user.connected.length}</span>
                            <span className="text-xs text-gray-500 uppercase">Connected</span>
                        </div>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <div className="text-sm text-gray-400">
                            People you are connected with across the ChatHub ecosystem.
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-400">Bio</label>
                            {isEditing ? (
                                <button 
                                    onClick={handleSaveBio}
                                    className="text-xs flex items-center text-green-400 hover:text-green-300"
                                >
                                    <Save size={14} className="mr-1" />
                                    Save
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        
                        {isEditing ? (
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-gray-900 text-white rounded p-3 border border-gray-700 focus:border-blue-500 outline-none resize-none h-24"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-300 italic">
                                {user.bio || "No bio yet."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
