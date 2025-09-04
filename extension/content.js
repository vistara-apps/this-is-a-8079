// Reddit Digest Extension - Content Script
// Handles text selection and highlighting on Reddit pages

(function() {
  'use strict';
  
  let isExtensionActive = false;
  let highlightOverlay = null;
  let selectedText = '';
  let selectionRange = null;
  
  // Initialize the extension on Reddit pages
  function initializeExtension() {
    console.log('Reddit Digest: Initializing on', window.location.href);
    
    // Check if we're on a Reddit page
    if (!isRedditPage()) {
      return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Check session status
    checkSessionStatus();
    
    // Add visual indicators
    addExtensionIndicators();
  }
  
  // Check if current page is Reddit
  function isRedditPage() {
    const hostname = window.location.hostname;
    return hostname.includes('reddit.com');
  }
  
  // Set up event listeners for text selection
  function setupEventListeners() {
    // Text selection events
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', cleanup);
  }
  
  // Handle text selection
  function handleTextSelection(event) {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 10) { // Minimum text length
        selectedText = text;
        selectionRange = selection.getRangeAt(0);
        showHighlightButton(event);
      } else {
        hideHighlightButton();
      }
    }, 100);
  }
  
  // Show highlight button near selection
  function showHighlightButton(event) {
    hideHighlightButton(); // Remove existing button
    
    const button = document.createElement('div');
    button.id = 'reddit-digest-highlight-btn';
    button.innerHTML = `
      <div class="rd-highlight-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4"/>
          <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/>
          <line x1="9" y1="11" x2="15" y2="11"/>
        </svg>
        Add to Digest
      </div>
    `;
    
    // Position button near selection
    const rect = selectionRange.getBoundingClientRect();
    button.style.cssText = `
      position: fixed;
      top: ${rect.top - 50}px;
      left: ${rect.left + rect.width / 2 - 60}px;
      z-index: 10000;
      pointer-events: auto;
    `;
    
    button.addEventListener('click', handleHighlightClick);
    document.body.appendChild(button);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (document.getElementById('reddit-digest-highlight-btn')) {
        hideHighlightButton();
      }
    }, 5000);
  }
  
  // Hide highlight button
  function hideHighlightButton() {
    const existingButton = document.getElementById('reddit-digest-highlight-btn');
    if (existingButton) {
      existingButton.remove();
    }
  }
  
  // Handle highlight button click
  async function handleHighlightClick() {
    try {
      hideHighlightButton();
      
      if (!selectedText) {
        showToast('No text selected', 'error');
        return;
      }
      
      // Extract Reddit thread information
      const threadInfo = extractThreadInfo();
      
      // Send to background script
      const response = await sendMessageToBackground({
        type: 'HIGHLIGHT_TEXT',
        data: {
          text: selectedText,
          sourceUrl: threadInfo.sourceUrl,
          threadTitle: threadInfo.threadTitle,
          redditData: threadInfo.redditData
        }
      });
      
      if (response.error) {
        showToast(response.error, 'error');
      } else {
        showToast('Added to digest!', 'success');
        highlightSelectedText();
        clearSelection();
      }
      
    } catch (error) {
      console.error('Error highlighting text:', error);
      showToast('Failed to add to digest', 'error');
    }
  }
  
  // Extract Reddit thread information
  function extractThreadInfo() {
    const url = window.location.href;
    let threadTitle = '';
    let subreddit = '';
    let postId = '';
    let commentId = '';
    
    // Extract thread title
    const titleElement = document.querySelector('h1[data-test-id="post-content-title"]') ||
                        document.querySelector('.title a') ||
                        document.querySelector('[data-click-id="title"]');
    
    if (titleElement) {
      threadTitle = titleElement.textContent.trim();
    }
    
    // Extract subreddit and post ID from URL
    const redditMatch = url.match(/reddit\.com\/r\/([^\/]+)\/comments\/([^\/]+)/);
    if (redditMatch) {
      subreddit = redditMatch[1];
      postId = redditMatch[2];
    }
    
    // Try to find comment ID if selection is within a comment
    const commentElement = findParentComment(selectionRange?.commonAncestorContainer);
    if (commentElement) {
      const commentLink = commentElement.querySelector('a[href*="comments"]');
      if (commentLink) {
        const commentMatch = commentLink.href.match(/#([a-zA-Z0-9]+)$/);
        if (commentMatch) {
          commentId = commentMatch[1];
        }
      }
    }
    
    return {
      sourceUrl: commentId ? `${url}#${commentId}` : url,
      threadTitle,
      redditData: {
        subreddit,
        postId,
        commentId,
        author: extractAuthor(commentElement)
      }
    };
  }
  
  // Find parent comment element
  function findParentComment(element) {
    if (!element) return null;
    
    let current = element.nodeType === Node.TEXT_NODE ? element.parentElement : element;
    
    while (current && current !== document.body) {
      if (current.classList.contains('Comment') ||
          current.classList.contains('comment') ||
          current.getAttribute('data-testid') === 'comment') {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  // Extract author from comment element
  function extractAuthor(commentElement) {
    if (!commentElement) return '';
    
    const authorElement = commentElement.querySelector('[data-testid="comment_author_link"]') ||
                         commentElement.querySelector('.author') ||
                         commentElement.querySelector('a[href*="/user/"]');
    
    return authorElement ? authorElement.textContent.trim() : '';
  }
  
  // Highlight selected text visually
  function highlightSelectedText() {
    if (!selectionRange) return;
    
    try {
      const span = document.createElement('span');
      span.className = 'reddit-digest-highlight';
      span.style.cssText = `
        background: linear-gradient(120deg, #a855f7 0%, #3b82f6 100%);
        color: white;
        padding: 2px 4px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(168, 85, 247, 0.3);
      `;
      
      selectionRange.surroundContents(span);
    } catch (error) {
      console.warn('Could not highlight text:', error);
    }
  }
  
  // Clear text selection
  function clearSelection() {
    window.getSelection().removeAllRanges();
    selectedText = '';
    selectionRange = null;
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `reddit-digest-toast reddit-digest-toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
      ${type === 'success' ? 'background: #10b981;' : ''}
      ${type === 'error' ? 'background: #ef4444;' : ''}
      ${type === 'info' ? 'background: #3b82f6;' : ''}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Add extension indicators
  function addExtensionIndicators() {
    // Add CSS for animations and styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .rd-highlight-button {
        background: linear-gradient(120deg, #a855f7, #3b82f6);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        transition: all 0.2s ease;
      }
      
      .rd-highlight-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
      }
      
      .reddit-digest-highlight {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .reddit-digest-highlight:hover {
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Check session status
  async function checkSessionStatus() {
    try {
      const response = await sendMessageToBackground({ type: 'GET_SESSION_STATUS' });
      isExtensionActive = response.hasSession;
      
      if (!response.hasSession && !response.requiresAuth) {
        // Show subtle indicator that extension is available
        showSessionPrompt();
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }
  
  // Show session prompt
  function showSessionPrompt() {
    // Only show once per page load
    if (document.getElementById('reddit-digest-session-prompt')) return;
    
    const prompt = document.createElement('div');
    prompt.id = 'reddit-digest-session-prompt';
    prompt.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1e1b4b, #312e81);
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 300px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <strong>Reddit Digest Ready</strong>
        </div>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          Start a curation session to highlight and save insights from this thread.
        </p>
        <button id="dismiss-prompt" style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.7;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.getElementById('reddit-digest-session-prompt')) {
        prompt.remove();
      }
    }, 10000);
    
    // Manual dismiss
    document.getElementById('dismiss-prompt').addEventListener('click', () => {
      prompt.remove();
    });
  }
  
  // Handle messages from background script
  function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'CONTEXT_MENU_HIGHLIGHT':
        // Handle context menu highlight
        if (message.text) {
          selectedText = message.text;
          handleHighlightClick();
        }
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  // Send message to background script
  function sendMessageToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }
  
  // Cleanup function
  function cleanup() {
    hideHighlightButton();
    const prompt = document.getElementById('reddit-digest-session-prompt');
    if (prompt) prompt.remove();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
  
  // Re-initialize on navigation (for SPA behavior)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(initializeExtension, 1000); // Delay for page to load
    }
  }).observe(document, { subtree: true, childList: true });
  
})();
