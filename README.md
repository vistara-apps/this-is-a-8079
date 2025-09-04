# Reddit Digest

> Curate insights from Reddit threads effortlessly with AI-powered synthesis.

Reddit Digest is a comprehensive platform that allows users to highlight and curate meaningful content from Reddit discussions, then use AI to synthesize insights and identify patterns across multiple threads.

## 🚀 Features

### Core Features
- **Thread Highlighting & Capture**: Highlight text directly within Reddit threads via browser extension
- **Document Compilation**: Automatically compile highlighted text into structured documents with source links
- **Cross-Thread Synthesis** (Pro): AI-powered analysis to identify themes and insights across multiple threads

### Key Benefits
- ✨ **Effortless Curation**: One-click highlighting and saving of Reddit insights
- 📊 **AI-Powered Analysis**: Identify patterns, themes, and sentiment across discussions
- 🔗 **Source Traceability**: Every highlight includes direct links to original Reddit comments
- 📱 **Seamless Integration**: Browser extension works natively with Reddit's interface
- 💎 **Freemium Model**: Free tier with 5 sessions/month, Pro tier for unlimited access

## 🏗️ Architecture

### Frontend (React + Vite)
- Modern React application with TypeScript
- Tailwind CSS for styling with custom design system
- Component-based architecture with reusable UI elements
- Real-time updates and responsive design

### Backend API (Node.js + Express)
- RESTful API with JWT authentication
- MongoDB database with Mongoose ODM
- Rate limiting and security middleware
- Comprehensive error handling and validation

### Browser Extension (Chrome/Firefox)
- Manifest V3 extension for modern browsers
- Content scripts for Reddit integration
- Background service worker for API communication
- Real-time text highlighting and curation

### AI Synthesis Engine
- Mock implementation with production-ready structure
- Supports OpenAI, Anthropic, and other AI providers
- Theme extraction, sentiment analysis, and insight generation
- Scalable architecture for advanced NLP features

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Browser Extension:**
- Manifest V3
- Chrome Extension APIs
- Content Scripts & Background Workers

**Development:**
- ESLint + Prettier for code quality
- Git hooks for pre-commit validation
- Environment-based configuration

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Modern web browser (Chrome/Firefox)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-8079.git
   cd this-is-a-8079
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   # At minimum, set JWT_SECRET and MONGODB_URI
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Frontend (http://localhost:5173)
   npm run dev
   
   # Terminal 2: Backend (http://localhost:3001)
   cd server
   npm run dev
   ```

5. **Load browser extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` folder
   - The Reddit Digest extension should now be active

## 🎯 Usage

### Getting Started

1. **Create an Account**
   - Visit the web app at `http://localhost:5173`
   - Register with your email and password
   - Choose between Free (5 sessions/month) or Pro (unlimited) tier

2. **Start a Curation Session**
   - Click "Start New Session" in the web app
   - Or use the browser extension popup on any Reddit page

3. **Highlight Content**
   - Navigate to any Reddit thread
   - Select text you want to curate
   - Click the "Add to Digest" button that appears
   - Content is automatically saved with source links

4. **Generate Insights** (Pro Feature)
   - Complete your curation session
   - Use the "Synthesize Insights" feature
   - Get AI-powered analysis of themes, sentiment, and patterns

### Browser Extension

The extension provides seamless integration with Reddit:

- **Automatic Detection**: Works on reddit.com, old.reddit.com
- **Visual Feedback**: Highlighted text is visually marked
- **Context Menu**: Right-click selected text for quick curation
- **Session Management**: Start/stop sessions directly from extension popup
- **Offline Support**: Local storage backup when API is unavailable

### API Integration

The platform provides a comprehensive REST API:

```javascript
// Example: Create a curation session
const response = await fetch('/api/curation/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Research Session',
    description: 'Curating insights about productivity tools'
  })
});
```

See [API Documentation](docs/API.md) for complete endpoint reference.

## 🏢 Business Model

### Freemium Subscription
- **Free Tier**: 5 curation sessions per month
- **Pro Tier**: $5/month for unlimited sessions + AI synthesis features

### Key Value Propositions
- **Time Savings**: Eliminate manual copy-paste workflows
- **Enhanced Research**: AI-powered insights across multiple discussions
- **Source Traceability**: Never lose track of where insights came from
- **Organized Knowledge**: Structured documents instead of scattered notes

## 🔧 Development

### Project Structure
```
reddit-digest/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   └── utils/             # Utility functions
├── server/                # Backend API server
│   ├── models/            # MongoDB models
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   └── index.js           # Server entry point
├── extension/             # Browser extension
│   ├── manifest.json      # Extension configuration
│   ├── background.js      # Service worker
│   ├── content.js         # Content script
│   └── popup.html         # Extension popup
├── docs/                  # Documentation
└── public/                # Static assets
```

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start with nodemon
npm start            # Start production server
npm test             # Run tests
```

### Environment Variables

Key environment variables for development:

```env
# Backend (.env)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/reddit-digest
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# Optional: AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   cd server && npm run build
   ```

2. **Configure production environment**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   export JWT_SECRET=your-production-jwt-secret
   ```

3. **Deploy using Docker**
   ```bash
   docker build -t reddit-digest .
   docker run -p 3001:3001 reddit-digest
   ```

4. **Or deploy to cloud platforms**
   - **Vercel/Netlify**: Frontend deployment
   - **Railway/Render**: Backend API deployment
   - **MongoDB Atlas**: Database hosting

### Browser Extension Distribution

1. **Build extension for production**
   ```bash
   # Update manifest.json with production API URLs
   # Test thoroughly in development mode
   ```

2. **Submit to browser stores**
   - Chrome Web Store for Chrome users
   - Firefox Add-ons for Firefox users
   - Edge Add-ons for Edge users

## 📊 Monitoring & Analytics

### Built-in Monitoring
- API request logging with Morgan
- Error tracking and reporting
- User usage analytics
- Performance metrics

### Recommended Production Tools
- **Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Uptime**: Pingdom, UptimeRobot

## 🔒 Security

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

### Security Best Practices
- Regular dependency updates
- Environment variable protection
- Database connection security
- API endpoint protection
- Extension content security policy

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Reddit for providing the platform that inspired this tool
- The open-source community for the amazing tools and libraries
- Beta testers and early users for valuable feedback

## 📞 Support

- **Documentation**: [API Docs](docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-8079/issues)
- **Email**: support@redditdigest.com
- **Discord**: [Community Server](https://discord.gg/reddit-digest)

---

**Made with ❤️ for the Reddit community**

*Reddit Digest helps you transform scattered Reddit insights into organized, actionable knowledge.*
