// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';

const UserProfile = ({ profile, account, twitterContract, tweetsCount }) => {
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [followedAddresses, setFollowedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');

  // Load followed addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('followedAddresses');
    if (saved) {
      setFollowedAddresses(JSON.parse(saved));
    }
  }, []);

  // Save followed addresses to localStorage
  const saveFollowedAddresses = (addresses) => {
    localStorage.setItem('followedAddresses', JSON.stringify(addresses));
    setFollowedAddresses(addresses);
  };

  const addFollowedAddress = () => {
    if (newAddress && !followedAddresses.includes(newAddress.toLowerCase())) {
      const updated = [...followedAddresses, newAddress.toLowerCase()];
      saveFollowedAddresses(updated);
      setNewAddress('');
    }
  };

  const removeFollowedAddress = (address) => {
    const updated = followedAddresses.filter(addr => addr !== address);
    saveFollowedAddresses(updated);
  };

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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
          {profile?.displayName?.charAt(0)?.toUpperCase() || '👤'}
        </div>
        
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {profile?.displayName || 'Anonymous'}
        </h2>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <span 
            onClick={copyAddress} 
            className="text-blue-500 cursor-pointer font-mono text-sm hover:text-blue-700 transition-colors"
          >
            {formatAddress(account)}
          </span>
          <button 
            onClick={copyAddress} 
            className="text-gray-400 hover:text-gray-600 transition-colors" 
            title="Copy address"
          >
            <i className="bi bi-clipboard"></i>
          </button>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-xs text-center">
            Share your address with friends so they can see your tweets in the global feed!
          </p>
        </div>
        
        {profile?.bio && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-gray-700 text-sm text-center">{profile.bio}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-around py-4 border-t border-b border-gray-200 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-500">{tweetsCount}</div>
          <div className="text-gray-500 text-xs">Tweets</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-blue-500">
            {loading ? '...' : totalLikes}
          </div>
          <div className="text-gray-500 text-xs">Likes</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-gray-900 font-semibold mb-3 text-sm">Follow Other Users</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter user address (0x...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={addFollowedAddress}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Follow
            </button>
          </div>
          
          {followedAddresses.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Following ({followedAddresses.length}):</p>
              {followedAddresses.map((addr, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-mono text-xs text-gray-700">
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </span>
                  <button
                    onClick={() => removeFollowedAddress(addr)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <a
        href={`https://sepolia.etherscan.io/address/${account}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
      >
        View on Etherscan
      </a>
    </div>
  );
};

export default UserProfile;
