import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function TrackItem() {
  const [searchId, setSearchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/batch/${searchId}`);
      const data = await response.json();
      if (data.success) {
        setBatchData(data.data);
      } else {
        alert("Item not found!");
        setBatchData(null);
      }
    } catch (error) {
      alert("Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setIsUpdating(true);
    try {
      const response = await fetch('http://localhost:5000/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchData.batchId, newStatus: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setNewStatus('');
        await handleSearch(); 
      } else {
        alert("Update failed: " + data.error);
      }
    } catch (error) {
      alert("Failed to connect to server.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isPastStatus = (targetStatus) => {
    const statuses = ["Harvested", "In Transit", "At Distribution Center", "Delivered"];
    const currentIndex = statuses.indexOf(batchData?.status || "Harvested");
    const targetIndex = statuses.indexOf(targetStatus);
    return currentIndex >= targetIndex;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ color: '#2c3e50', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>🔍 Track Item</h2>
        <p style={{ color: '#7f8c8d' }}>Search and verify agricultural products on the blockchain</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <input type="number" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Enter Item ID (e.g., 1, 2, 3...)" style={{ width: '300px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
          <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#5dade2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isLoading ? '...' : 'Track'}</button>
        </form>
      </div>

      {batchData && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📦</span>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>{batchData.cropName}</h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#196f3d', backgroundColor: '#d5f5e3', padding: '0.3rem 0.6rem', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>{batchData.status}</span>
            </div>
            <div style={{ color: '#7f8c8d', fontWeight: 'bold' }}>ID: #{batchData.batchId}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h4 style={{ color: '#2980b9', marginTop: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🌍 Product Information</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}><strong style={{ color: '#2c3e50' }}>Name:</strong> <span style={{ color: '#7f8c8d' }}>{batchData.cropName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}><strong style={{ color: '#2c3e50' }}>Origin:</strong> <span style={{ color: '#7f8c8d' }}>{batchData.origin}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}><strong style={{ color: '#2c3e50' }}>Quality:</strong> <span style={{ backgroundColor: '#fcf3cf', color: '#d4ac0d', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{batchData.quality}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}><strong style={{ color: '#2c3e50' }}>Price:</strong> <span style={{ color: '#7f8c8d' }}>{batchData.price} wei</span></div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center' }}>
              <h4 style={{ color: '#2c3e50', marginTop: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>🔗 Supply Chain</h4>
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #d5f5e3' }}>
                <div style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '0.9rem' }}>👨‍🌾 Farmer</div>
                <div style={{ fontSize: '0.75rem', color: '#27ae60', fontFamily: 'monospace' }}>{batchData.farmer.substring(0, 8)}...{batchData.farmer.substring(38)}</div>
              </div>
              <div style={{ color: '#bdc3c7', marginBottom: '0.5rem' }}>↓</div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem', border: isPastStatus("In Transit") ? '1px solid #d5f5e3' : 'none' }}>
                <div style={{ fontWeight: 'bold', color: isPastStatus("In Transit") ? '#27ae60' : '#2c3e50', fontSize: '0.9rem' }}>🚚 Distributor</div>
                <div style={{ fontSize: '0.75rem', color: isPastStatus("In Transit") ? '#27ae60' : '#95a5a6' }}>{isPastStatus("In Transit") ? "In Transit" : "Not assigned"}</div>
              </div>
              <div style={{ color: '#bdc3c7', marginBottom: '0.5rem' }}>↓</div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem', border: isPastStatus("Delivered") ? '1px solid #d5f5e3' : 'none' }}>
                <div style={{ fontWeight: 'bold', color: isPastStatus("Delivered") ? '#27ae60' : '#2c3e50', fontSize: '0.9rem' }}>🏬 Retailer</div>
                <div style={{ fontSize: '0.75rem', color: isPastStatus("Delivered") ? '#27ae60' : '#95a5a6' }}>{isPastStatus("Delivered") ? "Delivered to Store" : "Not assigned"}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 style={{ color: '#2c3e50', marginTop: 0, width: '100%', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📱 QR Code</h4>
              
              {/* UPDATED: QR Code now includes the Farmer's Hash Key! */}
              <QRCodeSVG 
                value={JSON.stringify({ 
                  id: batchData.batchId, 
                  hashKey: batchData.farmer, 
                  crop: batchData.cropName, 
                  origin: batchData.origin 
                })} 
                size={150} 
              />
              
              <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '1rem', textAlign: 'center' }}>
                Scan to pull hash key & verify
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #bdc3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>🛠️ Admin Tools</h4>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Advance this batch through the network.</p>
            </div>
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: '1rem' }}>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #bdc3c7', outline: 'none' }} required>
                <option value="" disabled>Select next status...</option>
                <option value="In Transit">Ship to Distributor</option>
                <option value="At Distribution Center">Arrive at Distribution</option>
                <option value="Delivered">Deliver to Retailer</option>
              </select>
              <button type="submit" disabled={isUpdating} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUpdating ? 'Writing...' : 'Update Network'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default TrackItem;