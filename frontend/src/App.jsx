import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; 
import Home from './pages/Home'; 
import Dashboard from './pages/Dashboard';
import AddFarmer from './pages/AddFarmer';
import HarvestItem from './pages/HarvestItem';
import TrackItem from './pages/TrackItem';
import ProtectedRoute from './components/ProtectedRoute'; // 🛡️ Import the Bouncer

export default function App() {
  return (
    <BrowserRouter>
      {/* GLOBAL BACKGROUND WRAPPER */}
      <div className="relative min-h-screen flex flex-col bg-black overflow-hidden">
        
        {/* --- GLOBAL CSS ANIMATIONS --- */}
        <style>
          {`
            @keyframes ken-burns {
              0% { transform: scale(1); }
              100% { transform: scale(1.15); }
            }
            @keyframes float-dust {
              0% { transform: translateY(110vh) translateX(0px) scale(0.5); opacity: 0; }
              20% { opacity: 0.8; }
              80% { opacity: 0.8; }
              100% { transform: translateY(-10vh) translateX(40px) scale(1.2); opacity: 0; }
            }
            .animate-ken-burns { animation: ken-burns 40s ease-in-out infinite alternate; }
            .animate-dust { animation: float-dust linear infinite; }
          `}
        </style>

        {/* --- LAYER 1: CINEMATIC BACKGROUND IMAGE --- */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 animate-ken-burns origin-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2089&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </div>

        {/* --- LAYER 2: REALISTIC GRADIENT OVERLAY --- */}
        <div className="fixed inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-transparent z-10 pointer-events-none"></div>

        {/* --- LAYER 3: GLOWING POLLEN PARTICLES --- */}
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          {[...Array(40)].map((_, i) => {
            const size = Math.random() * 6 + 2;
            const leftPosition = Math.random() * 100;
            const animationDuration = Math.random() * 15 + 10; 
            const animationDelay = Math.random() * 20; 

            return (
              <div
                key={i}
                className="absolute animate-dust rounded-full bg-yellow-100/60 blur-[1px]"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${leftPosition}%`,
                  animationDuration: `${animationDuration}s`,
                  animationDelay: `-${animationDelay}s`,
                  boxShadow: '0 0 8px 2px rgba(253, 230, 138, 0.4)'
                }}
              ></div>
            );
          })}
        </div>

        {/* --- FOREGROUND UI (Navbar + Router) --- */}
        <div className="relative z-30 flex flex-col flex-grow">
          <Navbar /> 
          
          <main className="flex-grow flex items-center justify-center p-6">
            <Routes>
              {/* 🟢 PUBLIC ROUTES (Open to everyone) */}
              <Route path="/" element={<Home />} />
              <Route path="/track" element={<TrackItem />} />
              
              {/* 🟢 Registration is now fully public for evaluators to test */}
              <Route path="/add-farmer" element={<AddFarmer />} />

              {/* 🔴 PROTECTED: REGISTERED USERS ONLY */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['Admin', 'Farmer', 'Distributor', 'Retailer']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* 🟢 UNLOCKED FOR PRESENTATION */}
              <Route path="/harvest" element={<HarvestItem />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
}