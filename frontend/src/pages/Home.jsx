import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-4xl text-center mb-16 p-10 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          Welcome to Agrowchain
        </h1>
        <p className="text-xl text-emerald-50 leading-relaxed font-medium drop-shadow-md">
          The next-generation decentralized agricultural supply chain. 
          Built on Web3 technology, Agrowchain ensures total transparency and immutability from the farm to the consumer. 
          Verify harvests, track logistical milestones, and guarantee fair compensation through our automated Escrow and Reputation ecosystem.
        </p>
      </div>

      {/* --- NAVIGATION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 hover:bg-white transition-all duration-300 group"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-md">📊</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h3>
          <p className="text-slate-600 text-center font-medium">View network analytics, recent activity, and AI insights.</p>
        </button>

        <button 
          onClick={() => navigate('/add-farmer')} 
          className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 hover:bg-white transition-all duration-300 group"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-md">🧑‍🌾</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Network Admin</h3>
          <p className="text-slate-600 text-center font-medium">Register new Farmers, Distributors, and Retailers.</p>
        </button>

        <button 
          onClick={() => navigate('/harvest')} 
          className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 hover:bg-white transition-all duration-300 group"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-md">🌱</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Harvest Item</h3>
          <p className="text-slate-600 text-center font-medium">Mint new crop batches to the blockchain and generate QR codes.</p>
        </button>

        <button 
          onClick={() => navigate('/track')} 
          className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 hover:bg-white transition-all duration-300 group"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-md">🔍</span>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Track Item</h3>
          <p className="text-slate-600 text-center font-medium">Scan QR codes and update live logistics milestones.</p>
        </button>

      </div>
    </div>
  );
}