import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Sprout, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({ count: 0 });
  const [timelineData, setTimelineData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [aiInsights, setAiInsights] = useState('Analyzing supply chain data...');
  const [isLoading, setIsLoading] = useState(true);

  // Colors for our bottleneck chart
  const STATUS_COLORS = {
    'Harvested': '#f39c12',
    'In Transit': '#3498db',
    'At Distribution Center': '#9b59b6',
    'Delivered': '#2ecc71'
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics');
        const result = await response.json();
        
        if (result.success && result.data) {
          const records = result.data;
          setDashboardData({ count: records.length });
          
          // --- 1. Process Temporal Data (Harvests by Date) ---
          const dateCounts = {};
          records.forEach(record => {
            const date = new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateCounts[date] = (dateCounts[date] || 0) + 1;
          });
          
          const formattedTimeline = Object.keys(dateCounts).map(date => ({
            date: date,
            Volume: dateCounts[date]
          }));
          setTimelineData(formattedTimeline);

          // --- 2. Process Bottleneck Data (Current Status) ---
          const statusCounts = { 'Harvested': 0, 'In Transit': 0, 'At Distribution Center': 0, 'Delivered': 0 };
          records.forEach(record => {
            if (statusCounts[record.status] !== undefined) {
              statusCounts[record.status]++;
            }
          });

          const formattedStatus = Object.keys(statusCounts).map(status => ({
            status: status,
            Items: statusCounts[status]
          }));
          setStatusData(formattedStatus);
        }
      } catch (err) {
        console.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAI = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ai-insights');
        const data = await res.json();
        if (data.success) setAiInsights(data.insights);
      } catch (err) {
        setAiInsights('AI analysis currently unavailable.');
      }
    };

    fetchAnalytics();
    fetchAI();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '5rem', color: '#7f8c8d' }}>Loading Enterprise Analytics...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ color: '#2c3e50', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
           Supply Chain Intelligence
        </h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>Real-time temporal analytics powered by Supabase PostgreSQL.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e8f8f5', borderRadius: '50%' }}><Sprout size={32} color="#27ae60" /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Network Volume</div>
            <div style={{ fontSize: '2rem', color: '#2c3e50', fontWeight: 'bold' }}>{dashboardData.count}</div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1rem', backgroundColor: '#eaf2f8', borderRadius: '50%' }}><Activity size={32} color="#2980b9" /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' }}>Database Sync</div>
            <div style={{ fontSize: '1.2rem', color: '#2c3e50', fontWeight: 'bold' }}>Real-time</div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef9e7', borderRadius: '50%' }}><ShieldCheck size={32} color="#f1c40f" /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' }}>Blockchain State</div>
            <div style={{ fontSize: '1.2rem', color: '#2c3e50', fontWeight: 'bold' }}>Secured</div>
          </div>
        </div>
      </div>

      {/* PHASE 2: AI ANALYST BANNER */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', border: '1px solid #e0e0e0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#8e44ad', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={24} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            AI Logistics Analyst
          </h4>
          <p style={{ margin: 0, color: '#34495e', lineHeight: '1.5', fontSize: '0.95rem', fontWeight: '500' }}>
            {aiInsights}
          </p>
        </div>
      </div>

      {/* PHASE 1: TEMPORAL CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Chart 1: The Timeline (Velocity) */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#2980b9"/> Harvest Velocity (Timeline)
          </h4>
          <div style={{ height: 300 }}>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecf0f1" />
                  <XAxis dataKey="date" tick={{fill: '#7f8c8d', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{fill: '#7f8c8d', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="Volume" stroke="#3498db" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7' }}>No timeline data yet</div>
            )}
          </div>
        </div>

        {/* Chart 2: Supply Chain Bottlenecks */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#e74c3c"/> Logistics Bottlenecks
          </h4>
          <div style={{ height: 300 }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ecf0f1" />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis dataKey="status" type="category" width={100} tick={{fill: '#2c3e50', fontSize: 11, fontWeight: 'bold'}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="Items" radius={[0, 4, 4, 0]} barSize={30}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7' }}>No logistics data yet</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;