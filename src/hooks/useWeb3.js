// src/hooks/useWeb3.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { CONTRACT_ADDRESSES, PROFILE_ABI, TWITTER_ABI, NETWORK_CONFIG } from '../contracts/config';

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [profileContract, setProfileContract] = useState(null);
  const [twitterContract, setTwitterContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider and check if already connected
  useEffect(() => {
    const initProvider = async () => {
      try {
        const ethereumProvider = await detectEthereumProvider();
        
        if (ethereumProvider) {
          const provider = new ethers.BrowserProvider(ethereumProvider);
          setProvider(provider);
          
          // Check if already connected
          const accounts = await ethereumProvider.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            await connectWallet(provider);
          }
        } else {
          setError('Please install MetaMask to use this dApp');
        }
      } catch (err) {
        console.error('Error initializing provider:', err);
        setError('Failed to initialize Web3 provider');
      }
    };

    initProvider();
  }, []);

  // Connect wallet function
  const connectWallet = async (existingProvider = null) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const providerToUse = existingProvider || provider;
      
      if (!providerToUse) {
        throw new Error('No provider available');
      }

      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Switch to correct network if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }]
        });
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG]
          });
        }
      }

      // Get signer and account
      const signer = await providerToUse.getSigner();
      const account = await signer.getAddress();
      
      setSigner(signer);
      setAccount(account);

      // Initialize contracts
      const profileContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PROFILE,
        PROFILE_ABI,
        signer
      );
      
      const twitterContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TWITTER,
        TWITTER_ABI,
        signer
      );

      setProfileContract(profileContract);
      setTwitterContract(twitterContract);

      console.log('Connected to account:', account);
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setProfileContract(null);
    setTwitterContract(null);
    setError(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    provider,
    signer,
    account,
    profileContract,
    twitterContract,
    isConnecting,
    error,
    connectWallet: () => connectWallet(),
    disconnectWallet
  };
};