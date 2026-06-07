import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';

// Safely import JSON files in modern ES Module environments
const AgrowchainArtifact = JSON.parse(readFileSync(new URL('./config/Agrowchain.json', import.meta.url)));
const ContractData = JSON.parse(readFileSync(new URL('./config/address.json', import.meta.url)));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- INITIALIZATIONS (WITH DEFENSIVE CHECKS) ---
// .trim() removes any hidden spaces or newlines that might cause crashes
const rawPk = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : "";
// Now it reads the freshly auto-deployed address directly from the .env file!
const rawAddress = process.env.CONTRACT_ADDRESS ? process.env.CONTRACT_ADDRESS.trim() : "";
const rawRpc = process.env.RPC_URL ? process.env.RPC_URL.trim() : "http://127.0.0.1:8545";

// 1. Check the Private Key
if (!rawPk.startsWith('0x') || rawPk.length !== 66) {
    console.error("🚨 FATAL ERROR: PRIVATE_KEY in .env is malformed.");
    console.error(`Expected 66 characters starting with 0x. Yours is ${rawPk.length} characters.`);
    process.exit(1); // Stop the server
}

// 2. Check the Contract Address
if (!rawAddress.startsWith('0x') || rawAddress.length !== 42) {
    console.error("🚨 FATAL ERROR: Invalid contract address.");
    console.error(`Your address currently reads: "${rawAddress}"`);
    process.exit(1); // Stop the server
}

// 3. If everything is perfect, connect to Web3!
const provider = new ethers.JsonRpcProvider(rawRpc);
const wallet = new ethers.Wallet(rawPk, provider);
const contract = new ethers.Contract(rawAddress, AgrowchainArtifact.abi, wallet);

// Initialize Supabase & Gemini
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 🛡️ API SECURITY MIDDLEWARE
// ==========================================
const requireApiKey = (req, res, next) => {
    const clientKey = req.headers['x-api-key'];
    const serverKey = process.env.FRONTEND_API_KEY;

    if (!clientKey || clientKey !== serverKey) {
        console.warn("🚨 BLOCKED: Unauthorized API access attempt.");
        return res.status(403).json({ success: false, error: "Unauthorized: Invalid or missing API Key." });
    }
    
    // If the key matches, allow them to proceed!
    next();
};

// ==========================================
// 📊 PHASE 1 & 2: ANALYTICS & AI ROUTES (Public Reads)
// ==========================================

app.get('/api/analytics', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('harvest_records')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: data });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch analytics." });
    }
});

app.get('/api/ai-insights', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('harvest_records')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        if (!data || data.length === 0) return res.json({ success: true, insights: "Not enough data for AI analysis yet." });

        const promptData = data.map(item => 
            `Crop: ${item.crop_name}, Status: ${item.status}, Date: ${new Date(item.created_at).toLocaleDateString()}`
        ).join('\n');

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are an expert supply chain analyst. Review the following recent agricultural tracking data. Provide 2 concise, actionable insights or warnings regarding bottlenecks, delivery efficiency, or volume. Keep it extremely professional and under 3 sentences total. Focus only on the data provided.\n\nData:\n${promptData}`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        res.json({ success: true, insights: aiResponse });
    } catch (error) {
        console.error("AI Insights Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate AI insights." });
    }
});

app.get('/api/recent-batches', async (req, res) => {
    try {
        const { data, error, count } = await supabase
            .from('harvest_records')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const formattedBatches = data.map(record => ({
            batchId: record.batch_id.toString(),
            farmer: record.farmer_address,
            cropName: record.crop_name, 
            status: record.status,
            timestamp: new Date(record.created_at).getTime()
        }));

        res.json({ success: true, count: count || 0, batches: formattedBatches });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch dashboard data." });
    }
});

// ==========================================
// 💰 PHASE 3: TOKEN ECONOMY & ACCOUNTS
// ==========================================

app.get('/api/accounts', async (req, res) => {
    try {
        const signers = await provider.listAccounts();
        
        const accountsData = await Promise.all(signers.map(async (signer) => {
            const addr = signer.address;
            
            const [isRegistered, score] = await Promise.all([
                contract.farmers(addr),
                contract.trustScore(addr)
            ]);

            return { 
                address: addr, 
                isRegistered: isRegistered,
                trustScore: score.toString() 
            };
        }));

        res.json({ success: true, accounts: accountsData });
    } catch (error) {
        console.error("Accounts Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch accounts" });
    }
});

app.get('/api/trust-score/:address', async (req, res) => {
    try {
        const score = await contract.trustScore(req.params.address);
        res.json({ success: true, score: score.toString() });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch trust score" });
    }
});

// 🔒 PROTECTED WRITES
app.post('/api/add-farmer', requireApiKey, async (req, res) => {
    try {
        const transaction = await contract.addFarmer(req.body.farmerAddress);
        const receipt = await transaction.wait();
        res.json({ success: true, transactionHash: receipt.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.reason || error.message });
    }
});

app.post('/api/add-distributor', requireApiKey, async (req, res) => {
    try {
        const transaction = await contract.addDistributor(req.body.address);
        const receipt = await transaction.wait();
        res.json({ success: true, transactionHash: receipt.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.reason || error.message });
    }
});

app.post('/api/add-retailer', requireApiKey, async (req, res) => {
    try {
        const transaction = await contract.addRetailer(req.body.address);
        const receipt = await transaction.wait();
        res.json({ success: true, transactionHash: receipt.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.reason || error.message });
    }
});

// ==========================================
// 🛒 PHASE 4: B2C MARKETPLACE (STORE KARNATAKA)
// ==========================================

app.get('/api/store/products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('harvest_records')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const displayProducts = data.map(item => ({
            id: item.batch_id,
            name: item.crop_name,
            origin: item.origin,
            quality: item.quality,
            priceWei: item.price,
            status: item.status,
            txHash: item.transaction_hash,
            date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        }));

        res.json({ success: true, products: displayProducts });
    } catch (error) {
        console.error("Store API Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch store products." });
    }
});

// ==========================================
// 📦 CORE SUPPLY CHAIN ROUTES
// ==========================================

// 🔒 PROTECTED WRITES
app.post('/api/add-batch', requireApiKey, async (req, res) => {
    try {
        const { cropName, origin, quality, price, farmerAddress } = req.body;
        if (!farmerAddress) return res.status(400).json({ success: false, error: "Farmer address required" });

        const signer = await provider.getSigner(farmerAddress);
        const contractWithSigner = contract.connect(signer);
        const transaction = await contractWithSigner.createBatch(cropName, origin, quality, price, "None");
        const receipt = await transaction.wait();
        
        const newBatchIdStr = await contract.batchCount();
        const newBatchId = parseInt(newBatchIdStr);

        const { error: dbError } = await supabase
            .from('harvest_records')
            .insert([{ 
                batch_id: newBatchId, 
                farmer_address: farmerAddress,
                crop_name: cropName,
                origin: origin,
                price: price.toString(),
                quality: quality,
                status: 'Harvested',
                transaction_hash: receipt.hash
            }]);

        if (dbError) console.error("Supabase Insert Error:", dbError);
        
        res.json({ success: true, transactionHash: receipt.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.reason || error.message });
    }
});

app.get('/api/batch/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('harvest_records')
            .select('*')
            .eq('batch_id', req.params.id)
            .single(); 

        if (error || !data) throw new Error("Item not found in database");

        res.json({
            success: true,
            data: {
                batchId: data.batch_id.toString(),
                farmer: data.farmer_address,
                cropName: data.crop_name,
                origin: data.origin,
                quality: data.quality,
                price: data.price,
                timestamp: new Date(data.created_at).getTime().toString(),
                status: data.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Batch not found" });
    }
});

// 🔒 PROTECTED WRITES
app.post('/api/update-status', requireApiKey, async (req, res) => {
    try {
        const { batchId, newStatus } = req.body;
        
        const transaction = await contract.updateBatchStatus(batchId, newStatus);
        const receipt = await transaction.wait();

        const { error: dbError } = await supabase
            .from('harvest_records')
            .update({ status: newStatus })
            .eq('batch_id', parseInt(batchId));

        if (dbError) console.error("Supabase Update Error:", dbError);

        res.json({ success: true, transactionHash: receipt.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.reason || error.message });
    }
});

app.post('/api/sync-harvest', requireApiKey, async (req, res) => {
    try {
        const { batchId, farmerAddress, cropName, origin, price, quality, txHash } = req.body;
        
        const { error: dbError } = await supabase
            .from('harvest_records')
            .insert([{ 
                batch_id: parseInt(batchId), 
                farmer_address: farmerAddress,
                crop_name: cropName,
                origin: origin,
                price: price.toString(),
                quality: quality,
                status: 'Harvested',
                transaction_hash: txHash
            }]);

        if (dbError) throw dbError;
        res.json({ success: true });
    } catch (error) {
        console.error("Supabase Sync Error:", error);
        res.status(500).json({ success: false, error: "Failed to sync to database" });
    }
});

// ==========================================
// 👥 NETWORK ADMIN - USER REGISTRATION
// ==========================================

// 🔒 PROTECTED WRITES
app.post('/api/add-user', requireApiKey, async (req, res) => {
    try {
        const { walletAddress, name, phone, cities, role } = req.body;

        if (!walletAddress || !name || !phone || !cities) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        console.log(`Checking if Hash Key exists in Database: ${walletAddress}`);

        const { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('wallet_address, name, role')
            .eq('wallet_address', walletAddress)
            .maybeSingle(); 

        if (existingUser) {
            return res.status(400).json({ 
                error: `This Hash Key is already registered to ${existingUser.name} (${existingUser.role}).` 
            });
        }

        console.log(`Authorizing ${walletAddress} as ${role} on the Blockchain...`);
        try {
            let tx;
            if (role === 'Farmer') {
                tx = await contract.addFarmer(walletAddress);
            } else if (role === 'Distributor') {
                tx = await contract.addDistributor(walletAddress);
            } else if (role === 'Retailer') {
                tx = await contract.addRetailer(walletAddress);
            }
            
            if (tx) {
                await tx.wait(); 
                console.log("✅ Blockchain authorization successful!");
            }
        } catch (bcError) {
            console.error("Blockchain Error:", bcError);
            return res.status(400).json({ error: `Blockchain rejected authorization: ${bcError.reason || bcError.message}` });
        }

        const { error: dbError } = await supabase
            .from('users')
            .insert([{ 
                wallet_address: walletAddress,
                name: name,
                phone: phone,
                cities: cities,
                role: role
            }]);

        if (dbError) {
            console.error("Supabase Insert Error:", dbError);
            return res.status(500).json({ error: 'Database insertion failed.' });
        }

        res.status(200).json({ 
            message: 'User successfully authorized on Blockchain and saved to Database!',
            user: { walletAddress, name, role }
        });

    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 🔒 PROTECTED WRITE: Revoke User Access
app.post('/api/remove-user', requireApiKey, async (req, res) => {
    try {
        const { walletAddress, role } = req.body;

        if (!walletAddress || !role) {
            return res.status(400).json({ error: 'Wallet address and role are required.' });
        }

        console.log(`Revoking ${role} access for ${walletAddress} on the Blockchain...`);
        
        // 1. UPDATE THE SOURCE OF TRUTH (Blockchain)
        try {
            let tx;
            if (role === 'Farmer') {
                tx = await contract.removeFarmer(walletAddress);
            } else if (role === 'Distributor') {
                tx = await contract.removeDistributor(walletAddress);
            } else if (role === 'Retailer') {
                tx = await contract.removeRetailer(walletAddress);
            }
            
            if (tx) {
                await tx.wait(); 
                console.log("✅ Blockchain revocation successful!");
            }
        } catch (bcError) {
            console.error("Blockchain Error:", bcError);
            return res.status(400).json({ error: `Blockchain rejected revocation: ${bcError.reason || bcError.message}` });
        }

        // 2. UPDATE THE METADATA (Supabase)
        const { error: dbError } = await supabase
            .from('users')
            .delete()
            .eq('wallet_address', walletAddress);

        if (dbError) {
            console.error("Supabase Delete Error:", dbError);
            // Note: In a production system, if SQL fails but Blockchain succeeds, 
            // you'd need a dead-letter queue or retry mechanism here.
            return res.status(500).json({ error: 'Removed from blockchain, but database deletion failed.' });
        }

        res.status(200).json({ message: 'User successfully wiped from entire system.' });

    } catch (error) {
        console.error("Error removing user:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));