import React from 'react';
import { Link } from 'react-router-dom'; // Replaced <a> tags with React Router's Link
import { useWeb3 } from '../context/Web3Context';
import { Icons } from '../assets/icons';

function Navbar() {
  // Pull the new userRole from the vault
  const { walletAddress, connectWallet, userRole } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Helper to color-code the role badge
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'Farmer': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Distributor': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Retailer': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'Admin': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-slate-900 text-white shadow-lg">
      
      {/* 1. LOGO IS NOW A HOME BUTTON 
        Clicking this will route the user back to your new Home.jsx grid
      */}
      <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-emerald-400 tracking-wide hover:text-emerald-300 transition-colors duration-200">
        <Icons.Harvest size={28} />
        <span>Agrowchain</span>
      </Link>

      {/* 2. ALL MIDDLE LINKS REMOVED - Your Home.jsx handles navigation now! */}

      <div className="flex items-center gap-3">
        {/* Dynamic Role Badge */}
        {walletAddress && (
          <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getRoleBadgeColor()}`}>
            {userRole}
          </div>
        )}

        {walletAddress ? (
          <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg font-bold tracking-wide">
            <Icons.Wallet size={18} />
            {formatAddress(walletAddress)}
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
          >
            <Icons.Disconnect size={18} />
            Connect MetaMask
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;