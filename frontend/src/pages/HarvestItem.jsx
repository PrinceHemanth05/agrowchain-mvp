import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Icons } from '../assets/icons';

function HarvestItem() {
  const { walletAddress, contract } = useWeb3();

  const [formData, setFormData] = useState({
    cropName: '', origin: '', price: '', quality: 'Standard'
  });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleHarvest = async (e) => {
    e.preventDefault();

    if (!walletAddress || !contract) {
      return setStatus({ loading: false, message: 'Please connect MetaMask first!', type: 'error' });
    }

    try {
      setStatus({ loading: true, message: 'Please approve the transaction in MetaMask...', type: 'info' });

      const tx = await contract.createBatch(
        formData.cropName, formData.origin, formData.quality, formData.price, "None"
      );

      setStatus({ loading: true, message: 'Transaction submitted! Waiting for blockchain confirmation...', type: 'info' });
      
      const receipt = await tx.wait();
      const newBatchId = await contract.batchCount();
      const batchIdStr = newBatchId.toString();

      // Sync to Supabase
      const syncResponse = await fetch('http://localhost:5000/api/sync-harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchIdStr,
          farmerAddress: walletAddress,
          cropName: formData.cropName,
          origin: formData.origin,
          price: formData.price,
          quality: formData.quality,
          txHash: receipt.hash
        })
      });

      if (!syncResponse.ok) throw new Error("Database failed to sync.");
      const syncData = await syncResponse.json();
      if (!syncData.success) throw new Error("Database sync error.");

      // Success! Instantly clear the form for the next rapid entry
      setStatus({ loading: false, message: `Success! Batch #${batchIdStr} recorded securely.`, type: 'success' });
      setFormData({ cropName: '', origin: '', price: '', quality: 'Standard' });
      
      // Auto-hide the success message after 4 seconds
      setTimeout(() => {
        setStatus({ loading: false, message: '', type: '' });
      }, 4000);

    } catch (error) {
      console.error(error);
      setStatus({ loading: false, message: error.message || 'Transaction failed.', type: 'error' });
    }
  };

  const getStatusStyles = () => {
    if (status.type === 'error') return 'bg-red-50 text-red-600 border-red-200';
    if (status.type === 'success') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  return (
    <div className="max-w-2xl mx-auto my-12 px-4 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3 mb-2">
          <Icons.Harvest size={36} className="text-emerald-600" /> Harvest New Item
        </h2>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleHarvest}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 font-bold mb-2 text-slate-700">
                <Icons.Harvest size={16} /> Product Name
              </label>
              <input type="text" required value={formData.cropName} onChange={(e) => setFormData({...formData, cropName: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-2 font-bold mb-2 text-slate-700">
                <Icons.Location size={16} /> Origin Location
              </label>
              <input type="text" required value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center gap-2 font-bold mb-2 text-slate-700">
                <Icons.DollarSign size={16} /> Price (in AGROW)
              </label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-2 font-bold mb-2 text-slate-700">
                <Icons.Award size={16} /> Quality Grade
              </label>
              <select value={formData.quality} onChange={(e) => setFormData({...formData, quality: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all bg-white">
                <option value="Premium">Premium Grade</option>
                <option value="Standard">Standard Grade</option>
                <option value="Processing">Processing Grade</option>
              </select>
            </div>
          </div>

          {status.message && (
            <div className={`p-4 mb-6 rounded-lg border flex items-center gap-3 font-medium transition-all duration-500 ${getStatusStyles()}`}>
              {status.message}
            </div>
          )}

          <button type="submit" disabled={status.loading || !walletAddress} className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <Icons.Send size={20} /> {status.loading ? 'Signing Transaction...' : 'Sign & Record Harvest'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default HarvestItem;