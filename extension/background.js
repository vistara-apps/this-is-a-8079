// Reddit Digest Extension - Background Script
// Handles extension lifecycle, storage, and communication between components

const API_BASE_URL = 'http://localhost:3001/api';

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Reddit Digest extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      isFirstTime: true,
      settings: {
        autoHighlight: true,
        showNotifications: true,
        apiUrl: API_BASE_URL
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'HIGHLIGHT_TEXT':
      handleHighlightText(message.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'GET_SESSION_STATUS':
      getSessionStatus()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'START_SESSION':
      startCurationSession()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'COMPLETE_SESSION':
      completeCurationSession()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'SYNTHESIZE_INSIGHTS':
      synthesizeInsights(message.sessionId)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'GET_USER_DATA':
      getUserData()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// Handle text highlighting
async function handleHighlightText(data, tab) {
  try {
    const { text, sourceUrl, threadTitle, redditData } = data;
    
    // Get current session
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('No active curation session. Please start a session first.');
    }
    
    // Get auth token
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      throw new Error('Please log in to curate content.');
    }
    
    // Send to API
    const response = await fetch(`${API_BASE_URL}/curation/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        text,
        sourceUrl,
        threadTitle,
        redditData
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save curated item');
    }
    
    const result = await response.json();
    
    // Update local storage
    await updateLocalCuratedItems(result.item);
    
    // Show notification
    await showNotification('Item Curated!', `Added "${text.substring(0, 50)}..." to your digest`);
    
    // Update badge
    await updateBadge();
    
    return { success: true, item: result.item };
    
  } catch (error) {
    console.error('Error highlighting text:', error);
    throw error;
  }
}

// Get current session status
async function getSessionStatus() {
  try {
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      return { hasSession: false, requiresAuth: true };
    }
    
    const response = await fetch(`${API_BASE_URL}/curation/sessions?status=active&limit=1`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get session status');
    }
    
    const data = await response.json();
    const hasActiveSession = data.sessions && data.sessions.length > 0;
    
    return {
      hasSession: hasActiveSession,
      session: hasActiveSession ? data.sessions[0] : null,
      requiresAuth: false
    };
    
  } catch (error) {
    console.error('Error getting session status:', error);
    return { hasSession: false, error: error.message };
  }
}

// Start new curation session
async function startCurationSession() {
  try {
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      throw new Error('Please log in to start a session.');
    }
    
    const response = await fetch(`${API_BASE_URL}/curation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        title: `Reddit Digest - ${new Date().toLocaleDateString()}`
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start session');
    }
    
    const result = await response.json();
    
    // Store session locally
    await chrome.storage.local.set({
      currentSession: result.session,
      curatedItems: []
    });
    
    // Update badge
    await updateBadge();
    
    return { success: true, session: result.session };
    
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
}

// Complete current session
async function completeCurationSession() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('No active session to complete.');
    }
    
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      throw new Error('Authentication required.');
    }
    
    const response = await fetch(`${API_BASE_URL}/curation/sessions/${session.sessionId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete session');
    }
    
    // Clear local session data
    await chrome.storage.local.remove(['currentSession', 'curatedItems']);
    
    // Update badge
    await updateBadge();
    
    return { success: true };
    
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

// Synthesize insights (Pro feature)
async function synthesizeInsights(sessionId) {
  try {
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      throw new Error('Authentication required.');
    }
    
    const response = await fetch(`${API_BASE_URL}/synthesis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({ sessionId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to synthesize insights');
    }
    
    const result = await response.json();
    return { success: true, synthesis: result.synthesis };
    
  } catch (error) {
    console.error('Error synthesizing insights:', error);
    throw error;
  }
}

// Get user data
async function getUserData() {
  try {
    const authData = await getStoredAuthData();
    if (!authData?.token) {
      return { authenticated: false };
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
    
    if (!response.ok) {
      // Token might be expired
      await chrome.storage.local.remove(['authToken', 'user']);
      return { authenticated: false };
    }
    
    const data = await response.json();
    return { authenticated: true, user: data.user };
    
  } catch (error) {
    console.error('Error getting user data:', error);
    return { authenticated: false, error: error.message };
  }
}

// Helper functions
async function getCurrentSession() {
  const data = await chrome.storage.local.get(['currentSession']);
  return data.currentSession || null;
}

async function getStoredAuthData() {
  const data = await chrome.storage.local.get(['authToken', 'user']);
  return {
    token: data.authToken,
    user: data.user
  };
}

async function updateLocalCuratedItems(newItem) {
  const data = await chrome.storage.local.get(['curatedItems']);
  const items = data.curatedItems || [];
  items.push(newItem);
  await chrome.storage.local.set({ curatedItems: items });
}

async function updateBadge() {
  try {
    const data = await chrome.storage.local.get(['curatedItems']);
    const itemCount = (data.curatedItems || []).length;
    
    if (itemCount > 0) {
      await chrome.action.setBadgeText({ text: itemCount.toString() });
      await chrome.action.setBadgeBackgroundColor({ color: '#8B5CF6' });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

async function showNotification(title, message) {
  try {
    const settings = await chrome.storage.local.get(['settings']);
    if (settings.settings?.showNotifications !== false) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title,
        message
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'reddit-digest-highlight',
    title: 'Add to Reddit Digest',
    contexts: ['selection'],
    documentUrlPatterns: [
      'https://www.reddit.com/*',
      'https://old.reddit.com/*',
      'https://reddit.com/*'
    ]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'reddit-digest-highlight') {
    // Send message to content script to handle the selection
    chrome.tabs.sendMessage(tab.id, {
      type: 'CONTEXT_MENU_HIGHLIGHT',
      text: info.selectionText
    });
  }
});
