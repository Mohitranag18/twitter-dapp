# 🐦 Dwitter dApp

A fully decentralized Twitter-like social media application built on the Ethereum blockchain using React and Web3 technologies. Users can create profiles, post tweets, and interact with content directly on the blockchain without any central authority.

## ✨ Features

- **🔐 Wallet Integration**: Connect with MetaMask wallet for secure authentication
- **👤 User Profiles**: Create and manage decentralized user profiles
- **📝 Tweet Creation**: Post tweets directly to the blockchain
- **❤️ Like System**: Like and unlike tweets with blockchain verification
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🔗 Smart Contracts**: Fully decentralized backend using Solidity smart contracts
- **⚡ Real-time Updates**: Live updates when new tweets are posted
- **🛡️ Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Ethers.js 6.15.0** - Ethereum library for Web3 interactions
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library

### Blockchain
- **Ethereum Sepolia Testnet** - Test network for development
- **Solidity Smart Contracts** - Profile and Twitter contracts
- **MetaMask** - Wallet integration
- **Web3 Provider** - Blockchain connectivity

### Development Tools
- **Create React App** - React application boilerplate
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Jest & React Testing Library** - Testing framework

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MetaMask** browser extension installed
- **Sepolia ETH** for transaction fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dwitter-dapp.git
   cd dwitter-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MetaMask**
   - Install [MetaMask](https://metamask.io/) browser extension
   - Switch to Sepolia testnet
   - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Start tweeting on the blockchain!

## 📱 How to Use

1. **Connect Wallet**: Click "Connect MetaMask" and approve the connection
2. **Create Profile**: Set up your display name and bio
3. **Start Tweeting**: Compose and post your first tweet
4. **Interact**: Like tweets from other users
5. **View Feed**: See all your tweets in your personal feed

## 🔧 Smart Contracts

The application uses two main smart contracts:

### Profile Contract
- **Address**: `0xbFc54bfe47c4EAaB59608ADf9b281Bd50CDfA8B9`
- **Functions**: Create profile, check registration, get profile data
- **Events**: ProfileCreated

### Twitter Contract
- **Address**: `0xE0C4734949c394a9C7A31FdCede6981Ec10D6b8c`
- **Functions**: Create tweets, get all tweets, like/unlike tweets
- **Events**: TweetCreated, TweetLiked

## 🌐 Network Configuration

- **Network**: Sepolia Testnet
- **Chain ID**: `0xAA36A7` (11155111)
- **RPC URL**: `https://sepolia.infura.io/v3/`
- **Block Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/)

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request.


## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the [Ethers.js documentation](https://docs.ethers.io/)
- Visit [MetaMask support](https://metamask.io/support/)

## 🔮 Future Enhancements

- [ ] Follow/Unfollow system
- [ ] Comments on tweets
- [ ] Image uploads (IPFS integration)
- [ ] Tweet search functionality
- [ ] User mentions and hashtags
- [ ] Mobile app (React Native)
- [ ] Multi-chain support

---

**Happy Tweeting on the Blockchain! 🚀**
