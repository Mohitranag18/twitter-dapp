// src/App.js
import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import ProfileSetup from './components/ProfileSetup';
import TweetComposer from './components/TweetComposer';
import TweetFeed from './components/TweetFeed';
import WalletConnect from './components/WalletConnect';
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';

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

  // Load tweets when user is registered
  useEffect(() => {
    const loadTweets = async () => {
      if (twitterContract && isRegistered && account) {
        try {
          const userTweets = await twitterContract.getAllTweets(account);
          console.log('Raw tweets from contract:', userTweets);
          console.log('First tweet type:', typeof userTweets[0]);
          console.log('First tweet is array:', Array.isArray(userTweets[0]));
          
          // Convert contract array format to object format
          const convertedTweets = userTweets.map(convertContractTweetToObject).filter(Boolean);
          console.log('Converted tweets:', convertedTweets);
          
          setTweets(convertedTweets);
        } catch (err) {
          console.error('Error loading tweets:', err);
          // Set empty array if call fails (no tweets yet)
          setTweets([]);
        }
      }
    };

    loadTweets();
  }, [twitterContract, isRegistered, account]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
        <div className="max-w-6xl mx-auto">
          <header className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-blue-500 text-3xl font-bold">🐦 Decentralized Twitter</h1>
              <p className="text-gray-600 mt-1">Connect your wallet to start tweeting on the blockchain!</p>
            </div>
          </header>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 text-white text-xl">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
        <div className="max-w-6xl mx-auto">
          <header className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
            <div>
              <h1 className="text-blue-500 text-3xl font-bold">🐦 Welcome to Decentralized Twitter</h1>
              <p className="text-gray-600 mt-1">Connected: {account}</p>
            </div>
            <button 
              onClick={disconnectWallet} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              Disconnect
            </button>
          </header>
          <ProfileSetup 
            profileContract={profileContract}
            onProfileCreated={handleProfileCreated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
          <h1 className="text-blue-500 text-3xl font-bold">🐦 Decentralized Twitter</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {userProfile?.displayName}!</span>
            <button 
              onClick={disconnectWallet} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              Disconnect
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div>
            <UserProfile 
              profile={userProfile}
              account={account}
              twitterContract={twitterContract}
              tweetsCount={tweets.length}
            />
          </div>

          <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
}

export default App;
