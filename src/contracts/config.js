// src/contracts/config.js

export const CONTRACT_ADDRESSES = {
  PROFILE: "0xbFc54bfe47c4EAaB59608ADf9b281Bd50CDfA8B9",
  TWITTER: "0xE0C4734949c394a9C7A31FdCede6981Ec10D6b8c"
};

// Contract ABIs (Application Binary Interfaces)
export const PROFILE_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getProfile",
    "outputs": [{"components": [{"internalType": "string", "name": "displayName", "type": "string"}, {"internalType": "string", "name": "bio", "type": "string"}], "internalType": "struct Profile.UserProfile", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_displayName", "type": "string"}, {"internalType": "string", "name": "_bio", "type": "string"}],
    "name": "setProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {"indexed": false, "internalType": "string", "name": "displayName", "type": "string"}, {"indexed": false, "internalType": "string", "name": "bio", "type": "string"}],
    "name": "ProfileCreated",
    "type": "event"
  }
];

export const TWITTER_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_profileContract", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "string", "name": "_tweet", "type": "string"}],
    "name": "createTweet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "getAllTweets",
    "outputs": [{"components": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "address", "name": "author", "type": "address"}, {"internalType": "string", "name": "content", "type": "string"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "uint256", "name": "likes", "type": "uint256"}], "internalType": "struct Twitter.Tweet[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_author", "type": "address"}],
    "name": "getTotalLikes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "author", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "likeTweet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "author", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "unlikeTweet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "author", "type": "address"}, {"indexed": false, "internalType": "string", "name": "content", "type": "string"}, {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}],
    "name": "TweetCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "liker", "type": "address"}, {"indexed": true, "internalType": "address", "name": "tweetAuthor", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "tweetId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "newLikeCount", "type": "uint256"}],
    "name": "TweetLiked",
    "type": "event"
  }
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: "0xAA36A7", // Sepolia testnet
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "SEP",
    decimals: 18
  },
  rpcUrls: ["https://sepolia.infura.io/v3/"],
  blockExplorerUrls: ["https://sepolia.etherscan.io/"]
};