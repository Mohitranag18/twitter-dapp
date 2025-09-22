// src/components/UserDiscovery.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const UserDiscovery = ({ profileContract, currentUser, onFollowUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followedAddresses, setFollowedAddresses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [publicProfiles, setPublicProfiles] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isMakingPublic, setIsMakingPublic] = useState(false);

  // Load followed addresses and discovered users
  useEffect(() => {
    const saved = localStorage.getItem('followedAddresses');
    if (saved) {
      setFollowedAddresses(JSON.parse(saved));
    }

    const discovered = localStorage.getItem('discoveredUsers');
    if (discovered) {
      setAllUsers(JSON.parse(discovered));
    }

    // Load public profiles
    loadPublicProfiles();
  }, []);

  // Save discovered users to localStorage
  const saveDiscoveredUsers = (users) => {
    localStorage.setItem('discoveredUsers', JSON.stringify(users));
    setAllUsers(users);
  };

  // Add user to discovered users list
  const addDiscoveredUser = (userData) => {
    const exists = allUsers.some(user => user.address.toLowerCase() === userData.address.toLowerCase());
    if (!exists) {
      const updated = [...allUsers, userData];
      saveDiscoveredUsers(updated);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Check if the searched address is a valid user
      const isRegistered = await profileContract.isRegistered(searchTerm.trim());

      if (isRegistered) {
        // Get user profile
        const profile = await profileContract.getProfile(searchTerm.trim());
        const userData = {
          address: searchTerm.trim(),
          displayName: profile[0] || 'Anonymous',
          bio: profile[1] || '',
          isRegistered: true
        };
        setSearchResults([userData]);
        
        // Add to discovered users
        addDiscoveredUser(userData);
      } else {
        // Show that user is not registered
        setSearchResults([{
          address: searchTerm.trim(),
          displayName: 'Not Registered',
          bio: 'This address is not registered on the platform',
          isRegistered: false
        }]);
      }
    } catch (err) {
      console.error('Error searching for user:', err);
      setSearchResults([{
        address: searchTerm.trim(),
        displayName: 'Error',
        bio: 'Could not verify this address',
        isRegistered: false
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = async (address) => {
    if (!followedAddresses.includes(address.toLowerCase())) {
      const updated = [...followedAddresses, address.toLowerCase()];
      setFollowedAddresses(updated);
      localStorage.setItem('followedAddresses', JSON.stringify(updated));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('followedAddressesChanged'));

      onFollowUser && onFollowUser(address);

      // Record follow relationship in Supabase
      try {
        await supabase
          .from('followers')
          .insert([
            {
              follower_address: currentUser.toLowerCase(),
              following_address: address.toLowerCase()
            }
          ]);
      } catch (err) {
        console.error('Error recording follow relationship:', err);
      }
    }
  };

  const handleUnfollow = async (address) => {
    const updated = followedAddresses.filter(addr => addr !== address.toLowerCase());
    setFollowedAddresses(updated);
    localStorage.setItem('followedAddresses', JSON.stringify(updated));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('followedAddressesChanged'));

    // Remove follow relationship from Supabase
    try {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_address', currentUser.toLowerCase())
        .eq('following_address', address.toLowerCase());
    } catch (err) {
      console.error('Error removing follow relationship:', err);
    }
  };

  const isFollowing = (address) => {
    return followedAddresses.includes(address.toLowerCase());
  };

  // Load public profiles from Supabase
  const loadPublicProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading public profiles:', error);
        return;
      }

      setPublicProfiles(data || []);
    } catch (err) {
      console.error('Error loading public profiles:', err);
    }
  };

  // Make profile public
  const makeProfilePublic = async () => {
    if (!currentUser) return;

    setIsMakingPublic(true);
    try {
      // Check if profile is already public
      const { data: existing } = await supabase
        .from('public_profiles')
        .select('id')
        .eq('address', currentUser.toLowerCase())
        .single();

      if (existing) {
        alert('Your profile is already public!');
        setShowConfirmDialog(false);
        setIsMakingPublic(false);
        return;
      }

      // Get user profile data
      const profile = await profileContract.getProfile(currentUser);
      const displayName = profile[0] || 'Anonymous';
      const bio = profile[1] || '';

      // Insert into Supabase
      const { error } = await supabase
        .from('public_profiles')
        .insert([
          {
            address: currentUser.toLowerCase(),
            display_name: displayName,
            bio: bio,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error making profile public:', error);
        alert('Failed to make profile public. Please try again.');
      } else {
        alert('Your profile is now public! Other users can find and follow you.');
        loadPublicProfiles(); // Refresh the list
      }
    } catch (err) {
      console.error('Error making profile public:', err);
      alert('Failed to make profile public. Please try again.');
    } finally {
      setShowConfirmDialog(false);
      setIsMakingPublic(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-gray-900 text-xl font-bold mb-6 flex items-center gap-2">
        <i className="bi bi-people-fill text-blue-600"></i>
        Social Network
      </h3>

      {/* Make Profile Public Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <i className="bi bi-globe-americas"></i>
          Make Your Profile Public
        </h4>
        <p className="text-blue-800 text-sm mb-4">
          Make your profile visible to all users on the platform. Other users can discover and follow you without needing your wallet address.
        </p>
        <button
          onClick={() => setShowConfirmDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <i className="bi bi-eye-fill"></i>
          Make Profile Public
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by wallet address (0x...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? <i className="bi bi-search"></i> : <i className="bi bi-search"></i>}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Search Results:</h4>
            {searchResults.map((user, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.displayName?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-500 font-mono">{formatAddress(user.address)}</p>
                      {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}
                    </div>
                  </div>

                  {user.isRegistered && user.address.toLowerCase() !== currentUser?.toLowerCase() && (
                    <button
                      onClick={() => isFollowing(user.address) ? handleUnfollow(user.address) : handleFollow(user.address)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isFollowing(user.address)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isFollowing(user.address) ? (
                        <>
                          <i className="bi bi-check-circle-fill mr-1"></i>
                          Following
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle mr-1"></i>
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!user.isRegistered && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    This user is not registered on the platform
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill text-yellow-500"></i>
              Confirm Public Profile
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to make your profile public? This will allow all users on the platform to discover and follow you.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                disabled={isMakingPublic}
              >
                Cancel
              </button>
              <button
                onClick={makeProfilePublic}
                disabled={isMakingPublic}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-blue-400"
              >
                {isMakingPublic ? (
                  <>
                    <i className="bi bi-hourglass-split mr-2"></i>
                    Making Public...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle mr-2"></i>
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Profiles Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="bi bi-star-fill text-yellow-500"></i>
          Public Profiles ({publicProfiles.length})
        </h4>
        {publicProfiles.length > 0 ? (
          <div className="space-y-3">
            {publicProfiles.map((profile, index) => (
              <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      {profile.display_name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{profile.display_name}</p>
                      <p className="text-sm text-gray-500 font-mono">{formatAddress(profile.address)}</p>
                      {profile.bio && <p className="text-sm text-gray-600">{profile.bio}</p>}
                    </div>
                  </div>

                  {profile.address.toLowerCase() !== currentUser?.toLowerCase() && (
                    <button
                      onClick={() => isFollowing(profile.address) ? handleUnfollow(profile.address) : handleFollow(profile.address)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isFollowing(profile.address)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                    >
                      {isFollowing(profile.address) ? (
                        <>
                          <i className="bi bi-check-circle-fill mr-1"></i>
                          Following
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle mr-1"></i>
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <i className="bi bi-star text-4xl mb-3 text-gray-300"></i>
            <p>No public profiles yet</p>
            <p className="text-sm">Be the first to make your profile public!</p>
          </div>
        )}
      </div>

      {/* All Users */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="bi bi-person-lines-fill text-gray-600"></i>
          All Users ({allUsers.length})
        </h4>
        {allUsers.length > 0 ? (
          <div className="space-y-3">
            {allUsers.map((user, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.displayName?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-500 font-mono">{formatAddress(user.address)}</p>
                      {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}
                    </div>
                  </div>

                  {user.address.toLowerCase() !== currentUser?.toLowerCase() && (
                    <button
                      onClick={() => isFollowing(user.address) ? handleUnfollow(user.address) : handleFollow(user.address)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isFollowing(user.address)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isFollowing(user.address) ? (
                        <>
                          <i className="bi bi-check-circle-fill mr-1"></i>
                          Following
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle mr-1"></i>
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="bi bi-people text-4xl mb-3 text-gray-300"></i>
            <p>No users discovered yet</p>
            <p className="text-sm">Search for users by their wallet address to get started</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <i className="bi bi-info-circle-fill"></i>
          How to use:
        </h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Search for users by their wallet address</li>
          <li>• Follow users to see their tweets in your feed</li>
          <li>• Share your address with friends to get followers</li>
          <li>• All discovered users appear in the "All Users" section</li>
          <li>• All interactions are recorded on the blockchain</li>
        </ul>
      </div>
    </div>
  );
};

export default UserDiscovery;