import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import AgrowchainArtifact from '../config/Agrowchain.json';
import ContractData from '../config/address.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState("Guest");

  useEffect(() => {
    checkWalletAndConnectContract();
    
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : "");
        if (accounts.length > 0) {
          checkWalletAndConnectContract(); 
        } else {
          setUserRole("Guest");
        }
      });

      // 🛡️ NEW: Listen for network changes to prevent silent errors!
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
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

          // 🛡️ Ensure MetaMask is actually connected to Localhost Hardhat
          const network = await provider.getNetwork();
          if (network.chainId !== 31337n && network.chainId !== 1337n) {
            console.error("🚨 WRONG NETWORK! Please switch MetaMask to Localhost 8545.");
            alert("Please switch your MetaMask network to Localhost 8545!");
          }

          const rawAddress = ContractData.address ? ContractData.address.trim() : "";
          if (!rawAddress || !rawAddress.startsWith("0x")) {
              console.error("Invalid contract address in config/address.json.");
              return; 
          }

          const agrowContract = new ethers.Contract(rawAddress, AgrowchainArtifact.abi, signer);
          setContract(agrowContract);

          // Call separated fetch function
          await fetchRole(agrowContract, currentAddress);
        }
      } catch (error) {
        console.error("Wallet check failed:", error);
      }
    }
  };

  // 🛠️ STRICT PRODUCTION ROLE FETCHING
  const fetchRole = async (agrowContract, currentAddress) => {
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

      const adminAddress = await agrowContract.admin();
      if (adminAddress.toLowerCase() === currentAddress.toLowerCase()) {
        setUserRole("Admin");
        return;
      }

      setUserRole("Unregistered");
    } catch (roleError) {
      console.error("Strict Web3 Error: Could not fetch roles from contract.", roleError);
    }
  };

  // ⚡ Manual trigger to force React to update the state immediately
  const refreshRole = async () => {
    if (contract && walletAddress) {
      await fetchRole(contract, walletAddress);
    } else {
      checkWalletAndConnectContract();
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
    <Web3Context.Provider value={{ walletAddress, connectWallet, contract, userRole, refreshRole }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);