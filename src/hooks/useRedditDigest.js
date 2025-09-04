import { useState, useEffect } from 'react';

// Mock data for demonstration
const mockThreads = [
  {
    id: '1',
    title: 'Best productivity apps for developers in 2024',
    url: 'https://reddit.com/r/webdev/comments/1',
    comments: [
      {
        id: 'c1',
        author: 'CodeMaster99',
        content: 'I\'ve been using Notion for project management and it\'s been a game changer. The database features are incredibly powerful for tracking bugs and features.',
        upvotes: 234
      },
      {
        id: 'c2',
        author: 'DevGuru2024',
        content: 'Linear is hands down the best issue tracker I\'ve used. The interface is clean and the GitHub integration is seamless.',
        upvotes: 156
      }
    ]
  }
];

export function useRedditDigest() {
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [curatedItems, setCuratedItems] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('reddit-digest-user');
    const savedSessions = localStorage.getItem('reddit-digest-sessions');
    const savedDocuments = localStorage.getItem('reddit-digest-documents');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('reddit-digest-user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('reddit-digest-documents', JSON.stringify(documents));
  }, [documents]);

  const login = (email) => {
    const newUser = {
      userId: Date.now().toString(),
      email,
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
      monthlyUsage: 0
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setCurrentSession(null);
    setCuratedItems([]);
  };

  const upgradeTosPro = () => {
    if (user) {
      setUser({...user, subscriptionTier: 'pro'});
    }
  };

  const startNewSession = () => {
    if (!user) return;
    
    if (user.subscriptionTier === 'free' && user.monthlyUsage >= 5) {
      alert('Free tier limit reached. Upgrade to Pro for unlimited sessions!');
      return;
    }

    const newSession = {
      sessionId: Date.now().toString(),
      userId: user.userId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    setCurrentSession(newSession);
    setCuratedItems([]);
    
    // Update user usage
    setUser(prev => ({
      ...prev,
      monthlyUsage: prev.monthlyUsage + 1
    }));
  };

  const addCuratedItem = (text, sourceUrl, threadTitle) => {
    if (!currentSession) {
      alert('Please start a new curation session first!');
      return;
    }

    const newItem = {
      itemId: Date.now().toString(),
      sessionId: currentSession.sessionId,
      text,
      sourceUrl,
      threadTitle,
      highlightedAt: new Date().toISOString()
    };

    setCuratedItems(prev => [...prev, newItem]);
  };

  const generateDocument = () => {
    if (!currentSession || curatedItems.length === 0) return;

    const newDocument = {
      id: Date.now().toString(),
      sessionId: currentSession.sessionId,
      title: `Reddit Digest - ${new Date().toLocaleDateString()}`,
      items: curatedItems,
      createdAt: new Date().toISOString(),
      type: 'basic'
    };

    setDocuments(prev => [...prev, newDocument]);
    
    // End current session
    setCurrentSession(null);
    setCuratedItems([]);
  };

  const synthesizeInsights = async () => {
    if (!user || user.subscriptionTier !== 'pro') {
      alert('Synthesis is a Pro feature. Upgrade to access advanced AI insights!');
      return;
    }

    if (curatedItems.length < 2) {
      alert('Need at least 2 curated items for synthesis.');
      return;
    }

    // Simulate AI processing
    const themes = [
      'Productivity Tools Preferences',
      'Developer Workflow Optimization',
      'Tool Integration Importance'
    ];

    const insights = [
      'Most developers prefer tools with strong integration capabilities',
      'Clean, intuitive interfaces are consistently valued over feature complexity',
      'Project management and issue tracking are top priorities for development teams'
    ];

    const synthesizedDoc = {
      id: Date.now().toString(),
      sessionId: currentSession.sessionId,
      title: `AI Synthesis - ${new Date().toLocaleDateString()}`,
      items: curatedItems,
      themes,
      insights,
      createdAt: new Date().toISOString(),
      type: 'synthesis'
    };

    setDocuments(prev => [...prev, synthesizedDoc]);
    
    // End current session
    setCurrentSession(null);
    setCuratedItems([]);
  };

  return {
    user,
    currentSession,
    curatedItems,
    documents,
    login,
    logout,
    upgradeTosPro,
    startNewSession,
    addCuratedItem,
    generateDocument,
    synthesizeInsights
  };
}