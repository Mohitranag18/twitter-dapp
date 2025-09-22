// src/App.js
import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import ProfileSetup from './components/ProfileSetup';
import TweetComposer from './components/TweetComposer';
import TweetFeed from './components/TweetFeed';
import WalletConnect from './components/WalletConnect';
import UserProfile from './components/UserProfile';
import UserDiscovery from './components/UserDiscovery';
import ErrorBoundary from './components/ErrorBoundary';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Helper function to convert contract tweet array to object
const convertContractTweetToObject = (tweetArray) => {
  console.log('Converting tweet array:', tweetArray);
  console.log('Array type:', typeof tweetArray, 'Is array:', Array.isArray(tweetArray));
  console.log('Array length:', tweetArray?.length);
  
  if (!Array.isArray(tweetArray) || tweetArray.length < 5) {
    console.log('Invalid tweet array, returning null');
    return null;
  }
  
  const converted = {
    id: tweetArray[0].toString(),
    author: tweetArray[1],
    content: tweetArray[2],
    timestamp: tweetArray[3].toString(),
    likes: Number(tweetArray[4])
  };
  
  console.log('Converted tweet:', converted);
  return converted;
};

function App() {
  const {
    account,
    profileContract,
    twitterContract,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet
  } = useWeb3();

  const [userProfile, setUserProfile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [currentSection, setCurrentSection] = useState('home'); // 'home', 'profile', 'social', 'settings'

  // Check if user is registered when account changes
  useEffect(() => {
    const checkRegistration = async () => {
      if (profileContract && account) {
        setLoading(true);
        try {
          const profile = await profileContract.getProfile(account);
          const registered = await profileContract.isRegistered(account);
          
          setUserProfile(profile);
          setIsRegistered(registered);
        } catch (err) {
          console.error('Error checking registration:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkRegistration();
  }, [profileContract, account]);

  // Load tweets when user is registered - feed from followed users only
  useEffect(() => {
    const loadFollowedTweets = async () => {
      if (twitterContract && isRegistered && account) {
        try {
          // Load tweets from followed users only
          
          // Start with current user's tweets
          const userTweets = await twitterContract.getAllTweets(account);
          let allTweets = [...userTweets];
          
          // Get followed addresses from localStorage
          const followedAddresses = JSON.parse(localStorage.getItem('followedAddresses') || '[]');
          
          // Try to get tweets from followed addresses
          for (const userAddress of followedAddresses) {
            try {
              if (userAddress.toLowerCase() !== account.toLowerCase()) {
                const tweets = await twitterContract.getAllTweets(userAddress);
                allTweets = [...allTweets, ...tweets];
              }
            } catch (err) {
              // User might not exist or have no tweets
              console.log(`Could not get tweets for address: ${userAddress}`);
            }
          }
          
          console.log('All tweets from followed users:', allTweets);
          
          // Convert contract array format to object format
          const convertedTweets = allTweets.map(convertContractTweetToObject).filter(Boolean);
          
          // Remove duplicates (in case same tweet appears multiple times)
          const uniqueTweets = convertedTweets.filter((tweet, index, self) => 
            index === self.findIndex(t => 
              t.content === tweet.content && 
              t.author.toLowerCase() === tweet.author.toLowerCase() &&
              t.timestamp === tweet.timestamp
            )
          );
          
          // Sort by timestamp (newest first)
          const sortedTweets = uniqueTweets.sort((a, b) => 
            Number(b.timestamp) - Number(a.timestamp)
          );
          
          console.log('Global feed tweets:', sortedTweets);
          
          setTweets(sortedTweets);
        } catch (err) {
          console.error('Error loading global tweets:', err);
          setTweets([]);
        }
      }
    };

    loadFollowedTweets();
  }, [twitterContract, isRegistered, account]);

  // Real-time updates using contract event listeners
  useEffect(() => {
    if (twitterContract && profileContract) {
      console.log('Setting up real-time event listeners');

      // Listen for new tweets
      const tweetFilter = twitterContract.filters.TweetCreated();
      twitterContract.on(tweetFilter, (id, author, content, timestamp, event) => {
        console.log('New tweet detected:', { id, author, content, timestamp });

        // Add new tweet to the feed if it's from a followed user or current user
        const followedAddresses = JSON.parse(localStorage.getItem('followedAddresses') || '[]');
        const isFromFollowedUser = followedAddresses.includes(author.toLowerCase()) || author.toLowerCase() === account?.toLowerCase();

        if (isFromFollowedUser) {
          const newTweet = {
            id: id.toString(),
            author: author,
            content: content,
            timestamp: timestamp.toString(),
            likes: 0
          };

          setTweets(prevTweets => {
            // Check if tweet already exists
            const exists = prevTweets.some(tweet =>
              tweet.content === newTweet.content &&
              tweet.author.toLowerCase() === newTweet.author.toLowerCase()
            );

            if (!exists) {
              return [newTweet, ...prevTweets].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
            }
            return prevTweets;
          });
        }
      });

      // Listen for likes
      const likeFilter = twitterContract.filters.TweetLiked();
      twitterContract.on(likeFilter, (liker, tweetAuthor, tweetId, newLikeCount, event) => {
        console.log('Tweet liked:', { liker, tweetAuthor, tweetId, newLikeCount });

        // Update like count in real-time
        setTweets(prevTweets =>
          prevTweets.map(tweet =>
            tweet.id === tweetId.toString() && tweet.author.toLowerCase() === tweetAuthor.toLowerCase()
              ? { ...tweet, likes: Number(newLikeCount) }
              : tweet
          )
        );
      });

      // Cleanup listeners on unmount
      return () => {
        twitterContract.removeAllListeners(tweetFilter);
        twitterContract.removeAllListeners(likeFilter);
      };
    }
  }, [twitterContract, profileContract, account]);

  const handleProfileCreated = (profile) => {
    setUserProfile(profile);
    setIsRegistered(true);
  };

  const handleTweetCreated = (newTweet) => {
    console.log('Adding new tweet to feed:', newTweet);
    setTweets(prev => {
      const updatedTweets = [...prev, newTweet];
      console.log('Updated tweets array:', updatedTweets);
      return updatedTweets;
    });
    
    // Refresh tweets from contract after a delay to get the actual contract data
    // But don't replace the local tweets, just sync the data
    setTimeout(async () => {
      if (twitterContract && account) {
        try {
          const userTweets = await twitterContract.getAllTweets(account);
          console.log('Refreshed tweets from contract:', userTweets);
          
          // Convert contract data to object format
          const convertedTweets = userTweets.map(convertContractTweetToObject).filter(Boolean);
          
          // Merge contract data with local tweets, preserving local changes
          setTweets(prevTweets => {
            const mergedTweets = prevTweets.map(localTweet => {
              // Find matching contract tweet by content and author
              const contractTweet = convertedTweets.find(ct => 
                ct.content === localTweet.content && 
                ct.author.toLowerCase() === localTweet.author.toLowerCase()
              );
              
              if (contractTweet) {
                // Use contract data but preserve local like count if it's higher
                return {
                  ...contractTweet,
                  likes: Math.max(Number(contractTweet.likes), Number(localTweet.likes))
                };
              }
              
              return localTweet;
            });
            
            // Add any new tweets from contract that aren't in local state
            const newContractTweets = convertedTweets.filter(ct => 
              !prevTweets.some(lt => 
                lt.content === ct.content && 
                lt.author.toLowerCase() === ct.author.toLowerCase()
              )
            );
            
            return [...mergedTweets, ...newContractTweets];
          });
        } catch (err) {
          console.error('Error refreshing tweets:', err);
        }
      }
    }, 5000); // Wait 5 seconds for contract to be updated
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="text-center mb-8">
            <img src="/logos/D__1_-removebg-preview.png" alt="Dwitter Logo" className="h-16 w-16 mx-auto mb-2" />
            <h2 className="text-gray-900 text-2xl font-bold">Dwitter</h2>
            <p className="text-gray-600 mt-2">Connect your wallet to start tweeting on the blockchain</p>
          </div>
          <WalletConnect 
            onConnect={connectWallet}
            isConnecting={isConnecting}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="text-center mb-8">
            <img src="/logos/D__1_-removebg-preview.png" alt="Dwitter Logo" className="h-16 w-16 mx-auto mb-2" />
            <h2 className="text-gray-900 text-2xl font-bold">Welcome</h2>
            <p className="text-gray-600 mt-2">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          </div>
          <div className="mb-6">
            <button 
              onClick={disconnectWallet} 
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
          <ProfileSetup 
            profileContract={profileContract}
            onProfileCreated={handleProfileCreated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-blue-500 text-xl font-bold flex items-center gap-2">
            <img src="/logos/D__1_-removebg-preview.png" alt="Dwitter Logo" className="h-8 w-8" />
            Dwitter
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">Welcome, {userProfile?.displayName}!</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Hidden on mobile */}
        <aside className="hidden md:block w-64 p-4 border-r border-gray-200 min-h-screen">
          <nav className="space-y-2">
            <div 
              onClick={() => setCurrentSection('home')}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentSection === 'home' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <i className="bi bi-house-fill text-xl"></i>
              <span className="font-medium">Home</span>
            </div>
            <div 
              onClick={() => setCurrentSection('profile')}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentSection === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <i className="bi bi-person-fill text-xl"></i>
              <span className="font-medium">Profile</span>
            </div>
            <div 
              onClick={() => setCurrentSection('social')}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentSection === 'social' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <i className="bi bi-people-fill text-xl"></i>
              <span className="font-medium">Social</span>
            </div>
            <div 
              onClick={() => setCurrentSection('settings')}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentSection === 'settings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <i className="bi bi-gear-fill text-xl"></i>
              <span className="font-medium">Settings</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 border-r border-gray-200 md:border-r min-h-screen">
          {currentSection === 'home' && (
            <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-6 space-y-6">
              <ErrorBoundary>
                <TweetComposer 
                  twitterContract={twitterContract}
                  onTweetCreated={handleTweetCreated}
                  currentUser={account}
                />
              </ErrorBoundary>
              <ErrorBoundary>
                <TweetFeed 
                  tweets={tweets}
                  twitterContract={twitterContract}
                  currentUser={account}
                />
              </ErrorBoundary>
            </div>
          )}

          {currentSection === 'profile' && (
            <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-6">
              <ErrorBoundary>
                <UserProfile 
                  profile={userProfile}
                  account={account}
                  twitterContract={twitterContract}
                  tweetsCount={tweets.length}
                />
              </ErrorBoundary>
            </div>
          )}

          {currentSection === 'social' && (
            <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-6">
              <ErrorBoundary>
                <UserDiscovery 
                  profileContract={profileContract}
                  currentUser={account}
                  onFollowUser={() => {
                    // Trigger tweet reload when following new users
                    const loadTweets = async () => {
                      if (twitterContract && account) {
                        try {
                          const userTweets = await twitterContract.getAllTweets(account);
                          let allTweets = [...userTweets];
                          
                          const followedAddresses = JSON.parse(localStorage.getItem('followedAddresses') || '[]');
                          
                          for (const userAddress of followedAddresses) {
                            try {
                              if (userAddress.toLowerCase() !== account.toLowerCase()) {
                                const tweets = await twitterContract.getAllTweets(userAddress);
                                allTweets = [...allTweets, ...tweets];
                              }
                            } catch (err) {
                              console.log(`Could not get tweets for address: ${userAddress}`);
                            }
                          }
                          
                          const convertedTweets = allTweets.map(convertContractTweetToObject).filter(Boolean);
                          
                          const uniqueTweets = convertedTweets.filter((tweet, index, self) => 
                            index === self.findIndex(t => 
                              t.content === tweet.content && 
                              t.author.toLowerCase() === tweet.author.toLowerCase() &&
                              t.timestamp === tweet.timestamp
                            )
                          );
                          
                          const sortedTweets = uniqueTweets.sort((a, b) => 
                            Number(b.timestamp) - Number(a.timestamp)
                          );
                          
                          setTweets(sortedTweets);
                        } catch (err) {
                          console.error('Error reloading tweets:', err);
                        }
                      }
                    };
                    loadTweets();
                  }}
                />
              </ErrorBoundary>
            </div>
          )}

          {currentSection === 'settings' && (
            <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <i className="bi bi-gear-fill text-gray-600"></i>
                  Settings
                </h2>

                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Wallet Address:</span>
                        <span className="font-mono text-sm text-gray-800">{account}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Display Name:</span>
                        <span className="text-gray-800">{userProfile?.displayName || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-medium mb-2">Disconnect Wallet</h4>
                      <p className="text-red-700 text-sm mb-4">
                        Disconnecting your wallet will log you out of the application. You can reconnect at any time.
                      </p>
                      <button
                        onClick={disconnectWallet}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <i className="bi bi-box-arrow-right mr-2"></i>
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center">
        <div 
          onClick={() => setCurrentSection('home')}
          className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
            currentSection === 'home' ? 'text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <i className="bi bi-house-fill text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </div>
        <div 
          onClick={() => setCurrentSection('profile')}
          className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
            currentSection === 'profile' ? 'text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <i className="bi bi-person-fill text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </div>
        <div 
          onClick={() => setCurrentSection('social')}
          className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
            currentSection === 'social' ? 'text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <i className="bi bi-people-fill text-xl"></i>
          <span className="text-xs mt-1">Social</span>
        </div>
        <div 
          onClick={() => setCurrentSection('settings')}
          className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
            currentSection === 'settings' ? 'text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <i className="bi bi-gear-fill text-xl"></i>
          <span className="text-xs mt-1">Settings</span>
        </div>
      </nav>
    </div>
  );
}

export default App;
