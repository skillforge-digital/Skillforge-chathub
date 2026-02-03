import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundType = 
    | 'cosmic-void' 
    | 'earth-orbit' 
    | 'moon-surface' 
    | 'mars-colony'
    | 'digital-grid' 
    | 'sun-dust' 
    | 'silver-dust';

interface BackgroundContextType {
    currentBackground: BackgroundType;
    setCustomBackground: (bg: BackgroundType | null) => void; // null means use global rotation
    isGlobal: boolean;
}

const BackgroundContext = createContext<BackgroundContextType | null>(null);

const BACKGROUND_ROTATION: BackgroundType[] = [
    'cosmic-void',   // Sunday
    'earth-orbit',   // Monday
    'digital-grid',  // Tuesday
    'sun-dust',      // Wednesday
    'moon-surface',  // Thursday
    'silver-dust',   // Friday
    'mars-colony'    // Saturday
];

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customBackground, setCustomBackground] = useState<BackgroundType | null>(null);
    const [globalBackground, setGlobalBackground] = useState<BackgroundType>('cosmic-void');

    // Update global background based on day of week
    useEffect(() => {
        const updateDailyBackground = () => {
            const day = new Date().getDay();
            setGlobalBackground(BACKGROUND_ROTATION[day]);
        };

        updateDailyBackground();
        // Optional: Set interval to check for day change, but on mount is usually enough for single session
    }, []);

    const value = {
        currentBackground: customBackground || globalBackground,
        setCustomBackground,
        isGlobal: !customBackground
    };

    return (
        <BackgroundContext.Provider value={value}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) throw new Error('useBackground must be used within a BackgroundProvider');
    return context;
};
