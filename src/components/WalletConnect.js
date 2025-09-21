// src/components/WalletConnect.js
import React from 'react';

const WalletConnect = ({ onConnect, isConnecting, error }) => {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl text-center max-w-lg w-full shadow-xl mx-4">
        <h2 className="text-blue-500 text-3xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-700 mb-6">To use this decentralized Twitter, you need to connect your MetaMask wallet.</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}
        
        <button 
          onClick={onConnect} 
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 mx-auto mb-8"
        >
          {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
        </button>
        
        <div className="text-left bg-blue-50 p-6 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Requirements:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              MetaMask browser extension installed
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Connected to Sepolia testnet
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Some Sepolia ETH for transaction fees
            </li>
          </ul>
          
          <div className="flex justify-center gap-4 mt-6">
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-medium underline"
            >
              Install MetaMask
            </a>
            <a 
              href="https://sepoliafaucet.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-medium underline"
            >
              Get Sepolia ETH
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
