import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GeneralChat from './pages/GeneralChat';
import HubChat from './pages/HubChat';
import DirectMessages from './pages/DirectMessages';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

import BackgroundWrapper from './components/BackgroundWrapper';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <BackgroundWrapper>
      <div className="flex h-screen text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
            {children}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/general" />} />
      
      <Route path="/general" element={
        <ProtectedRoute>
          <GeneralChat />
        </ProtectedRoute>
      } />
      
      <Route path="/hub/:hubId" element={
        <ProtectedRoute>
          <HubChat />
        </ProtectedRoute>
      } />
      
      <Route path="/dms" element={
        <ProtectedRoute>
          <DirectMessages />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
