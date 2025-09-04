import React, { useState } from 'react';
import { ArrowUp, MessageCircle, Share, Award, Plus } from 'lucide-react';

const mockThreads = [
  {
    id: '1',
    title: 'Best productivity apps for developers in 2024',
    subreddit: 'webdev',
    author: 'TechEnthusiast',
    upvotes: 847,
    comments: [
      {
        id: 'c1',
        author: 'CodeMaster99',
        content: 'I\'ve been using Notion for project management and it\'s been a game changer. The database features are incredibly powerful for tracking bugs and features. The templates save so much time when setting up new projects.',
        upvotes: 234,
        replies: []
      },
      {
        id: 'c2',
        author: 'DevGuru2024',
        content: 'Linear is hands down the best issue tracker I\'ve used. The interface is clean and the GitHub integration is seamless. It makes sprint planning actually enjoyable.',
        upvotes: 156,
        replies: [
          {
            id: 'c2r1',
            author: 'StartupDev',
            content: 'Agreed! Linear\'s keyboard shortcuts are amazing. I can create and assign issues in seconds.',
            upvotes: 45
          }
        ]
      },
      {
        id: 'c3',
        author: 'RemoteWorker',
        content: 'For time tracking, I swear by Toggl Track. The reporting features help me understand where my time actually goes. Plus the Pomodoro timer integration keeps me focused.',
        upvotes: 89,
        replies: []
      }
    ]
  },
  {
    id: '2',
    title: 'How to stay motivated while learning to code?',
    subreddit: 'learnprogramming',
    author: 'NewCoder2024',
    upvotes: 423,
    comments: [
      {
        id: 'c4',
        author: 'SeniorDev',
        content: 'Build projects that solve real problems in your life. I started by automating my expense tracking and it kept me engaged because I could see immediate value.',
        upvotes: 178,
        replies: []
      },
      {
        id: 'c5',
        author: 'BootcampGrad',
        content: 'Join coding communities! Discord servers and Reddit help so much. Having people to ask questions and celebrate small wins with makes all the difference.',
        upvotes: 134,
        replies: []
      }
    ]
  }
];

export function RedditThreadSimulator({ onTextHighlighted, isSessionActive }) {
  const [selectedThread, setSelectedThread] = useState(mockThreads[0]);
  const [highlightedTexts, setHighlightedTexts] = useState(new Set());

  const handleTextSelection = (event, commentId, commentContent, author) => {
    if (!isSessionActive) {
      alert('Please start a curation session first!');
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 10) {
      const sourceUrl = `https://reddit.com/r/${selectedThread.subreddit}/comments/${selectedThread.id}#${commentId}`;
      
      onTextHighlighted(selectedText, sourceUrl, selectedThread.title);
      
      // Add to highlighted texts for visual feedback
      setHighlightedTexts(prev => new Set([...prev, selectedText]));
      
      // Clear selection
      selection.removeAllRanges();
      
      // Show success feedback
      const rect = event.target.getBoundingClientRect();
      showHighlightFeedback(rect.left + rect.width / 2, rect.top);
    }
  };

  const showHighlightFeedback = (x, y) => {
    const feedback = document.createElement('div');
    feedback.innerHTML = '✅ Added to curation!';
    feedback.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y - 30}px;
      background: linear-gradient(120deg, #a855f7, #3b82f6);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
      transform: translateX(-50%);
      animation: fadeInOut 2s ease-in-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      document.body.removeChild(feedback);
      document.head.removeChild(style);
    }, 2000);
  };

  const Comment = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-600 pl-4' : ''} mb-4`}>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-blue-400 text-sm font-medium">{comment.author}</span>
        <span className="text-xs text-gray-500">•</span>
        <span className="text-xs text-gray-500">2h ago</span>
      </div>
      
      <div
        className="text-gray-300 text-sm leading-relaxed mb-3 cursor-text select-text hover:bg-white/5 p-2 rounded transition-colors"
        onMouseUp={(e) => handleTextSelection(e, comment.id, comment.content, comment.author)}
        style={{ userSelect: 'text' }}
      >
        {comment.content}
      </div>
      
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <button className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
          <ArrowUp className="h-3 w-3" />
          <span>{comment.upvotes}</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
          <MessageCircle className="h-3 w-3" />
          <span>Reply</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
          <Share className="h-3 w-3" />
          <span>Share</span>
        </button>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Thread Selector */}
      <div className="card-gradient rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Select Reddit Thread</h3>
        <div className="space-y-2">
          {mockThreads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedThread.id === thread.id
                  ? 'bg-purple-600/30 border border-purple-400'
                  : 'bg-black/20 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-medium">{thread.title}</h4>
                  <p className="text-gray-400 text-xs">r/{thread.subreddit} • {thread.upvotes} upvotes</p>
                </div>
                {selectedThread.id === thread.id && (
                  <div className="text-purple-400">
                    <Award className="h-4 w-4" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reddit Thread Display */}
      <div className="card-gradient rounded-lg overflow-hidden">
        {/* Thread Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center space-y-1">
              <button className="text-gray-400 hover:text-orange-400 transition-colors">
                <ArrowUp className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-white">{selectedThread.upvotes}</span>
              <button className="text-gray-400 hover:text-orange-400 transition-colors rotate-180">
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                {selectedThread.title}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Posted by u/{selectedThread.author}</span>
                <span>•</span>
                <span>3 hours ago</span>
                <span>•</span>
                <span className="text-blue-400">r/{selectedThread.subreddit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Comments ({selectedThread.comments.length})
            </h3>
            {isSessionActive && (
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <Plus className="h-4 w-4" />
                <span>Selection mode active</span>
              </div>
            )}
          </div>

          {!isSessionActive && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 Start a curation session to highlight and save text from these comments.
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {selectedThread.comments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}