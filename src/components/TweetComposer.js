// src/components/TweetComposer.js
import React, { useState } from 'react';

const TweetComposer = ({ twitterContract, onTweetCreated, currentUser }) => {
  const [tweetContent, setTweetContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const MAX_LENGTH = 280;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tweetContent.trim()) {
      setError('Tweet content cannot be empty');
      return;
    }

    if (tweetContent.length > MAX_LENGTH) {
      setError(`Tweet is too long. Maximum ${MAX_LENGTH} characters allowed.`);
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      // Call the smart contract to create tweet
      const transaction = await twitterContract.createTweet(tweetContent.trim());
      
      console.log('Tweet transaction sent:', transaction.hash);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      
      console.log('Tweet created successfully!', receipt);
      
      // Create tweet object with a unique ID based on transaction hash and timestamp
      const uniqueId = `${receipt.hash}-${Date.now()}`;
      const newTweet = {
        id: uniqueId,
        author: currentUser,
        content: tweetContent.trim(),
        timestamp: Math.floor(Date.now() / 1000),
        likes: 0
      };
      
      console.log('Created new tweet:', newTweet);
      
      // Call the callback to add tweet to feed
      onTweetCreated(newTweet);
      
      // Clear the form
      setTweetContent('');
      
    } catch (err) {
      console.error('Error creating tweet:', err);
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Transaction was rejected by user');
      } else if (err.message && err.message.includes('USER NOT REGISTERED')) {
        setError('User not registered. Please check your profile.');
      } else if (err.message && err.message.includes('Tweet is too long')) {
        setError('Tweet is too long. Please shorten your message.');
      } else if (err.reason) {
        setError(err.reason);
      } else if (err.message) {
        setError(`Contract Error: ${err.message}`);
      } else {
        setError('Failed to post tweet. Please check contract addresses and try again.');
      }
    } finally {
      setIsPosting(false);
    }
  };

  const remainingChars = MAX_LENGTH - tweetContent.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h3 className="text-blue-500 text-xl font-bold mb-4">✨ What's happening?</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            disabled={isPosting}
            className={`w-full p-4 border-2 rounded-xl text-base resize-vertical min-h-[80px] transition-colors focus:outline-none ${
              isOverLimit 
                ? 'border-red-500 focus:border-red-600' 
                : 'border-gray-200 focus:border-blue-500'
            } disabled:opacity-50`}
          />
          
          <div className="flex justify-between items-center mt-3">
            <div className={`text-sm ${isOverLimit ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
              {remainingChars} characters remaining
            </div>
            
            <button 
              type="submit" 
              disabled={isPosting || !tweetContent.trim() || isOverLimit}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isPosting ? 'Posting...' : '🐦 Tweet'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}
      </form>
      
      <div className="bg-blue-50 rounded-lg p-3 mt-4">
        <p className="text-blue-700 text-sm">
          �� Each tweet is stored permanently on the blockchain
        </p>
      </div>
    </div>
  );
};

export default TweetComposer;
