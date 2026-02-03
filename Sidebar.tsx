import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, User, LogOut, Lock } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname.includes(path) ? "bg-white/10 text-blue-400 border-l-2 border-blue-500" : "hover:bg-white/5";

    return (
        <div className="w-64 glass-sidebar flex flex-col p-4 z-20">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">SkillForge</h1>
            
            <nav className="flex-1 space-y-2">
                <Link to="/general" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/general')}`}>
                    <Users size={20} />
                    <span>General Hub</span>
                </Link>

                <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Specialized Hubs</p>
                    {['traders', 'creative', 'developers'].map((hub) => {
                        const isLocked = user?.hub && user.hub !== hub;
                        return (
                            <Link 
                                key={hub}
                                to={isLocked ? '#' : `/hub/${hub}`} 
                                className={`flex items-center justify-between px-4 py-2 rounded-lg transition ${
                                    isLocked ? 'text-gray-600 cursor-not-allowed' : isActive(`/hub/${hub}`)
                                }`}
                                onClick={(e) => isLocked && e.preventDefault()}
                            >
                                <span className="capitalize">{hub} Hub</span>
                                {isLocked && <Lock size={14} />}
                            </Link>
                        )
                    })}
                </div>

                <Link to="/dms" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dms')}`}>
                    <MessageSquare size={20} />
                    <span>Messages</span>
                </Link>

                <Link to="/profile" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/profile')}`}>
                    <User size={20} />
                    <span>Profile</span>
                </Link>
            </nav>

            <div className="pt-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
                        {user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-200">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.hub ? `${user.hub} Hub` : 'No Hub'}</p>
                    </div>
                </div>
                <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
