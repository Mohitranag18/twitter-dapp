// src/components/ProfileSetup.js
import React, { useState } from 'react';

const ProfileSetup = ({ profileContract, onProfileCreated }) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (displayName.trim().length > 50) {
      setError('Display name must be 50 characters or less');
      return;
    }

    if (bio.length > 160) {
      setError('Bio must be 160 characters or less');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Call the smart contract to create profile
      const transaction = await profileContract.setProfile(
        displayName.trim(),
        bio.trim()
      );
      
      console.log('Transaction sent:', transaction.hash);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      
      console.log('Profile created successfully!', receipt);
      
      // Notify parent component
      onProfileCreated({
        displayName: displayName.trim(),
        bio: bio.trim()
      });
      
    } catch (err) {
      console.error('Error creating profile:', err);
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Transaction was rejected by user');
      } else if (err.reason) {
        setError(err.reason);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create profile. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisplayNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setDisplayName(value);
    }
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= 160) {
      setBio(value);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl max-w-lg w-full shadow-xl mx-4">
        <h2 className="text-blue-500 text-3xl font-bold mb-4 text-center">📝 Create Your Profile</h2>
        <p className="text-gray-700 text-center mb-8">Set up your profile to start using Decentralized Twitter</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-gray-800 font-semibold mb-2">
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={handleDisplayNameChange}
              placeholder="Enter your display name"
              disabled={isCreating}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <small className={`text-sm ${displayName.length > 45 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
              {displayName.length}/50 characters
            </small>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-gray-800 font-semibold mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself..."
              rows={3}
              disabled={isCreating}
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-vertical"
            />
            <small className={`text-sm ${bio.length > 150 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
              {bio.length}/160 characters
            </small>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600">❌ {error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isCreating || !displayName.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white p-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </button>
        </form>
        
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <p className="text-blue-700 text-sm">
            <strong>💡 Note:</strong> Creating a profile requires a blockchain transaction and will cost some gas fees.
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-blue-500 font-semibold mb-4">📋 Preview:</h4>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 text-lg truncate">
                {displayName || 'Display Name'}
              </div>
              <p className="text-gray-600 text-sm italic mt-1">
                {bio || 'Your bio will appear here...'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">📋 Requirements:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              Display name is required
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              Display name must be 50 characters or less
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              Bio is optional but limited to 160 characters
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              Profile will be stored permanently on blockchain
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              You can update your profile later
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
