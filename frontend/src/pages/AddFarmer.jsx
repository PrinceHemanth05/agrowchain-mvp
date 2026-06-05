import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

export default function AddFarmer() {
  // Pull the connected hash key (walletAddress) from MetaMask
  const { walletAddress } = useWeb3();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Set the initial state. If a wallet is already connected, it auto-fills immediately!
  const [formData, setFormData] = useState({
    walletAddress: walletAddress || '', 
    name: '',
    phone: '',
    cities: '',
    role: 'Farmer'
  });

  // This watches MetaMask. If the user changes their account, the form updates automatically.
  useEffect(() => {
    if (walletAddress) {
      setFormData((prevData) => ({
        ...prevData,
        walletAddress: walletAddress
      }));
    }
  }, [walletAddress]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to database');
      }

      setMessage(`Successfully registered ${formData.name} as a ${formData.role}!`);
      
      // Reset form, but keep the connected wallet address intact
      setFormData({ 
        walletAddress: walletAddress || '', 
        name: '', 
        phone: '', 
        cities: '', 
        role: 'Farmer' 
      }); 
    } catch (error) {
      console.error(error);
      setMessage(`Registration Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🧑‍🌾</span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Network Registration</h2>
          <p className="text-slate-500 mt-2 font-medium">Register a participant's name, role, and hash key into the database.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder="e.g., Ramesh Kumar"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Operating Cities</label>
            <input 
              type="text" 
              name="cities"
              value={formData.cities}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="e.g., Mysuru, Mandya, Bengaluru"
            />
          </div>

          {/* Hash Key Field - Now Auto-Populated! */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hash Key (Wallet Address)</label>
            <input 
              type="text" 
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-mono text-sm text-emerald-900"
              placeholder="Connect MetaMask to auto-fill..."
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">Auto-detected from your connected Web3 wallet.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Supply Chain Role</label>
            <div className="grid grid-cols-3 gap-4">
              {['Farmer', 'Distributor', 'Retailer'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-3 px-4 rounded-xl font-bold border transition-all duration-200 ${
                    formData.role === role 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl font-semibold text-center ${message.includes('Failed') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Save Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}