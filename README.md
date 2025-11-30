# Secure Era - P2P Encrypted File Sharing

![Secure Era](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)

**Secure Era** is a production-ready, peer-to-peer encrypted file sharing application that enables secure file transfers directly between browsers using WebRTC. Files are never uploaded to or stored on any server.

## 🌟 Features

- **End-to-End Encryption**: Files encrypted with AES-GCM 256-bit before transfer
- **Peer-to-Peer Transfer**: Direct browser-to-browser via WebRTC DataChannels
- **No Server Storage**: Files never touch the server - only signaling
- **Multi-User Support**: Unique room IDs for isolated transfers
- **Real-Time Progress**: Transfer speed, percentage, and ETA
- **File Preview**: Image and video preview for receivers
- **Drag & Drop**: Easy file selection
- **Mobile Responsive**: Works on desktop and mobile
- **Zero Tracking**: No cookies, no analytics, no data collection

## 🏗️ Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Sender    │                    │  Receiver   │
│  (Browser)  │                    │  (Browser)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  WebRTC Signaling (WebSocket)   │
       │         ┌──────────────┐         │
       └────────►│    Server    │◄────────┘
                 │  (Railway)   │
                 └──────────────┘
       
       ◄──────────────────────────────────►
         P2P Encrypted File Transfer
              (WebRTC DataChannel)
```

## 🚀 Tech Stack

### Frontend (Vercel)
- React 18
- Vite
- Tailwind CSS v3
- React Router
- Web Crypto API
- WebRTC

### Backend (Railway)
- Node.js
- Express
- WebSocket (ws)
- UUID

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Railway account (for backend deployment)
- Vercel account (for frontend deployment)

### Local Development

#### 1. Clone the repository
```bash
cd c:\file\secure-era
```

#### 2. Setup Backend
```bash
cd server
npm install
npm start
```

The server will start on `http://localhost:3000`

#### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 4. Test Locally
1. Open `http://localhost:5173` in your browser
2. Click "Send File" and select a file
3. Copy the shareable link
4. Open the link in an incognito window
5. Watch the file transfer!

## 🌐 Deployment

### Backend Deployment (Railway)

1. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Create a new project
   - Connect your GitHub repository or deploy from CLI

2. **Configure Environment Variables**
   ```
   PORT=3000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

3. **Deploy**
   - Railway will automatically detect the Node.js app
   - Your WebSocket server will be available at `wss://your-app.railway.app`

### Frontend Deployment (Vercel)

1. **Create Vercel Project**
   - Go to [Vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `client` directory as the root

2. **Configure Environment Variables**
   ```
   VITE_BACKEND_URL=wss://your-railway-app.railway.app
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-app.vercel.app`

4. **Update Backend CORS**
   - Go back to Railway
   - Update `CORS_ORIGIN` to your Vercel URL
   - Redeploy the backend

## 🔒 Security

- **AES-GCM 256-bit encryption**: Industry-standard encryption
- **Web Crypto API**: Browser-native cryptography
- **No server access**: Server never sees file contents or keys
- **Unique room IDs**: Isolated transfer sessions
- **Automatic cleanup**: Rooms expire after 1 hour

## 📱 Usage

### Sending a File
1. Click "Send File"
2. Select or drag & drop your file
3. Share the generated link with the receiver
4. Wait for receiver to connect
5. File transfers automatically

### Receiving a File
1. Open the shared link
2. Wait for secure connection
3. File downloads automatically
4. Preview and download

## 🎯 Portfolio / Interview Talking Points

**"Secure Era is a peer-to-peer encrypted file sharing web app I built for my portfolio. The frontend is deployed on Vercel and connects via WebSocket to a Node.js signaling backend on Railway. Each session uses a unique room ID to connect sender and receiver, ensuring files are never stored on a server."**

### Key Technical Highlights:
- **WebRTC DataChannels** for P2P transfer
- **Web Crypto API** for E2E encryption
- **WebSocket** for signaling
- **React Hooks** for state management
- **Tailwind CSS** for responsive design
- **Production deployment** on Vercel + Railway

### Interview Questions You Can Answer:
1. **How does WebRTC work?** - Explain STUN, ICE, offer/answer
2. **How is encryption implemented?** - AES-GCM, key generation, chunk encryption
3. **How do you handle large files?** - Chunking (16KB), progress tracking
4. **What happens if connection fails?** - Auto-reconnect, error handling
5. **How is the app secured?** - E2E encryption, no server storage, HTTPS

## 📄 License

MIT License - feel free to use this project for your portfolio!

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome!

## 📧 Contact

Built by [Your Name] - [Your Email]

---

**⭐ Star this repo if you found it helpful!**
