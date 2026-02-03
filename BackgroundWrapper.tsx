import React from 'react';
import { BackgroundType, useBackground } from '../context/BackgroundContext';

const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentBackground } = useBackground();

    const renderBackground = () => {
        switch (currentBackground) {
            case 'cosmic-void':
                return (
                    <div className="absolute inset-0 bg-black overflow-hidden z-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#000] to-black"></div>
                        <div className="stars"></div>
                        <div className="stars2"></div>
                        <div className="stars3"></div>
                    </div>
                );
            case 'earth-orbit':
                return (
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/60 z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop" 
                            alt="Earth" 
                            className="w-full h-full object-cover animate-slow-zoom"
                        />
                    </div>
                );
            case 'moon-surface':
                return (
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/60 z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=1973&auto=format&fit=crop" 
                            alt="Moon" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                );
            case 'mars-colony':
                return (
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/60 z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1614728853970-32a2f50d15a3?q=80&w=1974&auto=format&fit=crop" 
                            alt="Mars" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                );
            case 'digital-grid':
                return (
                    <div className="absolute inset-0 bg-[#0a0a0a] z-0 overflow-hidden perspective-grid">
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent"></div>
                    </div>
                );
            case 'sun-dust':
                return (
                    <div className="absolute inset-0 bg-[#1a0f00] z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-black"></div>
                        <div className="particles-gold"></div>
                    </div>
                );
            case 'silver-dust':
                return (
                    <div className="absolute inset-0 bg-[#0f1115] z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-black"></div>
                        <div className="particles-silver"></div>
                    </div>
                );
            default:
                return <div className="absolute inset-0 bg-gray-900 z-0"></div>;
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden text-white">
            {renderBackground()}
            <div className="relative z-10 w-full h-full backdrop-blur-[2px]">
                {children}
            </div>
        </div>
    );
};

export default BackgroundWrapper;
