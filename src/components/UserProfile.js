// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';

const UserProfile = ({ profile, account, twitterContract, tweetsCount }) => {
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTotalLikes = async () => {
      if (twitterContract && account) {
        setLoading(true);
        try {
          const likes = await twitterContract.getTotalLikes(account);
          setTotalLikes(Number(likes));
        } catch (err) {
          console.error('Error fetching total likes:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTotalLikes();
  }, [twitterContract, account, tweetsCount]); // Re-fetch when tweets count changes

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      // You could add a toast notification here
      alert('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
          {profile?.displayName?.charAt(0)?.toUpperCase() || '👤'}
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          {profile?.displayName || 'Anonymous'}
        </h2>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <span 
            onClick={copyAddress} 
            className="text-blue-500 cursor-pointer font-mono hover:text-blue-700 transition-colors"
          >
            {formatAddress(account)}
          </span>
          <button 
            onClick={copyAddress} 
            className="text-gray-500 hover:text-gray-700 transition-colors" 
            title="Copy address"
          >
            📋
          </button>
        </div>
        
        {profile?.bio && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-center">{profile.bio}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-around py-6 border-t border-b border-gray-200 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{tweetsCount}</div>
          <div className="text-gray-600 text-sm">Tweets</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {loading ? '...' : totalLikes}
          </div>
          <div className="text-gray-600 text-sm">Total Likes</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
          🔗 Blockchain Info
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Network:</span>
            <span className="font-medium text-gray-800">Sepolia Testnet</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Status:</span>
            <span className="font-medium text-green-600">✅ Connected</span>
          </div>
        </div>
      </div>
      
      <a
        href={`https://sepolia.etherscan.io/address/${account}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 px-4 py-3 rounded-lg font-medium transition-all duration-300"
      >
        View on Etherscan
      </a>
    </div>
  );
};

export default UserProfile;
