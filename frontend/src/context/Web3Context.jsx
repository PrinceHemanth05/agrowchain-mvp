import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import AgrowchainArtifact from '../config/Agrowchain.json';
import ContractData from '../config/address.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  
  // State to hold the user's blockchain role
  const [userRole, setUserRole] = useState("Guest");

  useEffect(() => {
    checkWalletAndConnectContract();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : "");
        if (accounts.length > 0) {
          checkWalletAndConnectContract(); // Re-check role when account changes
        } else {
          setUserRole("Guest");
        }
      });
    }
  }, []);

  const checkWalletAndConnectContract = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const currentAddress = accounts[0];
          setWalletAddress(currentAddress);
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // --- 🛡️ DEFENSIVE SHIELD AGAINST ENS ERRORS ---
          const rawAddress = ContractData.address ? ContractData.address.trim() : "";
          console.log("🔍 REACT THINKS THE ADDRESS IS:", `"${rawAddress}"`);

          if (!rawAddress || !rawAddress.startsWith("0x")) {
              console.error("🚨 FRONTEND FATAL ERROR: Invalid contract address in config/address.json.");
              console.error("Please add '0x' to the beginning of your address in frontend/src/config/address.json!");
              return; // Stop execution here to prevent the ENS crash
          }
          // ----------------------------------------------

          const agrowContract = new ethers.Contract(rawAddress, AgrowchainArtifact.abi, signer);
          setContract(agrowContract);

          // Query the smart contract to determine the role
          try {
            const isFarmer = await agrowContract.farmers(currentAddress);
            if (isFarmer) {
              setUserRole("Farmer");
              return;
            }
            
            const isDistributor = await agrowContract.distributors(currentAddress);
            if (isDistributor) {
              setUserRole("Distributor");
              return;
            }

            const isRetailer = await agrowContract.retailers(currentAddress);
            if (isRetailer) {
              setUserRole("Retailer");
              return;
            }

            // Optional: Check if admin (contract owner)
            const adminAddress = await agrowContract.admin();
            if (adminAddress.toLowerCase() === currentAddress.toLowerCase()) {
              setUserRole("Admin");
              return;
            }

            setUserRole("Unregistered");
          } catch (roleError) {
            console.error("Could not fetch roles from contract. Make sure you are on Localhost!", roleError);
          }
        }
      } catch (error) {
        console.error("Wallet check failed:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      checkWalletAndConnectContract(); 
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <Web3Context.Provider value={{ walletAddress, connectWallet, contract, userRole }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);