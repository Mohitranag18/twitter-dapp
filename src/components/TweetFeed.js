// src/components/TweetFeed.js
import React, { useState } from 'react';

const TweetItem = ({ tweet, twitterContract, currentUser, onLikeUpdate }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  console.log('TweetItem rendering with tweet:', tweet);
  console.log('Tweet properties:', {
    id: tweet?.id,
    author: tweet?.author,
    content: tweet?.content,
    timestamp: tweet?.timestamp,
    likes: tweet?.likes
  });

  const formatTimestamp = (timestamp) => {
    console.log('Formatting timestamp:', timestamp, 'type:', typeof timestamp);
    if (!timestamp) return 'Invalid Date';
    try {
      const date = new Date(Number(timestamp) * 1000);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return 'Invalid Date';
    }
  };

  const formatAddress = (address) => {
    console.log('Formatting address:', address, 'type:', typeof address);
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLike = async () => {
    if (!tweet?.author || tweet?.id === undefined) {
      setError('Invalid tweet data');
      return;
    }

    setIsLiking(true);
    setError('');

    try {
      const transaction = await twitterContract.likeTweet(
        tweet.author,
        Number(tweet.id)
      );
      
      await transaction.wait();
      
      // Update the like count locally
      if (onLikeUpdate) {
        onLikeUpdate(tweet.id, Number(tweet.likes) + 1);
      }
      
    } catch (err) {
      console.error('Error liking tweet:', err);
      
      if (err.reason) {
        setError(err.reason);
      } else {
        setError('Failed to like tweet');
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!tweet?.author || tweet?.id === undefined) {
      setError('Invalid tweet data');
      return;
    }

    setIsLiking(true);
    setError('');

    try {
      const transaction = await twitterContract.unlikeTweet(
        tweet.author,
        Number(tweet.id)
      );
      
      await transaction.wait();
      
      // Update the like count locally
      if (onLikeUpdate) {
        onLikeUpdate(tweet.id, Number(tweet.likes) - 1);
      }
      
    } catch (err) {
      console.error('Error unliking tweet:', err);
      
      if (err.reason) {
        setError(err.reason);
      } else {
        setError('Failed to unlike tweet');
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-blue-500 font-medium">
            {formatAddress(tweet?.author)}
          </span>
          {tweet?.author && tweet.author.toLowerCase() === currentUser?.toLowerCase() && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              You
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {formatTimestamp(tweet?.timestamp)}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-800 text-lg leading-relaxed">
          {tweet?.content || 'Content not available'}
        </p>
      </div>
      
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={isLiking || !tweet?.author}
            className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 px-3 py-2 rounded-lg text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            ❤️ {Number(tweet?.likes) || 0}
          </button>
          
          {Number(tweet?.likes) > 0 && (
            <button
              onClick={handleUnlike}
              disabled={isLiking || !tweet?.author}
              className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-lg text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              💔 Unlike
            </button>
          )}
        </div>
        
        {error && (
          <small className="text-red-500 font-medium">{error}</small>
        )}
      </div>
    </div>
  );
};

const TweetFeed = ({ tweets, twitterContract, currentUser }) => {
  const [feedTweets, setFeedTweets] = useState(tweets);

  // Update local state when tweets prop changes
  React.useEffect(() => {
    console.log('TweetFeed received tweets:', tweets);
    setFeedTweets(tweets);
  }, [tweets]);

  const handleLikeUpdate = (tweetId, newLikeCount) => {
    setFeedTweets(prevTweets => {
      const updatedTweets = prevTweets.map(tweet => {
        // Use exact ID matching
        if (tweet.id === tweetId) {
          return { ...tweet, likes: newLikeCount };
        }
        return tweet;
      });
      
      return updatedTweets;
    });
  };

  if (!feedTweets || feedTweets.length === 0) {
    return (
      <div>
        <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
          <h3 className="text-gray-500 text-xl font-semibold mb-3">📝 No tweets yet</h3>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      </div>
    );
  }

  // Sort tweets by timestamp (newest first)
  const sortedTweets = [...feedTweets].sort((a, b) => 
    Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div>
      <h3 className="text-blue-500 text-2xl font-bold mb-6">
        🐦 Your Tweets ({feedTweets.length})
      </h3>
      
      <div className="space-y-5">
        {sortedTweets.map((tweet, index) => (
          <TweetItem
            key={`${tweet.author}-${tweet.id}-${index}`}
            tweet={tweet}
            twitterContract={twitterContract}
            currentUser={currentUser}
            onLikeUpdate={handleLikeUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default TweetFeed;
