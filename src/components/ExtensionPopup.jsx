import React from 'react';
import { Plus, FileText, Sparkles, ArrowRight, Clock } from 'lucide-react';

export function ExtensionPopup({ 
  user, 
  currentSession, 
  curatedItems, 
  onStartSession, 
  onGenerateDocument, 
  onSynthesizeInsights 
}) {
  if (!user) {
    return (
      <div className="card-gradient rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Reddit Digest Extension</h3>
        <p className="text-gray-300 mb-4">
          Sign in to start curating insights from Reddit threads.
        </p>
        <div className="text-sm text-gray-400">
          ✨ Highlight text on Reddit<br />
          📝 Compile into documents<br />
          🔍 AI-powered synthesis
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Curation Session</h3>
        {user.subscriptionTier === 'pro' && (
          <div className="flex items-center text-yellow-400 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="mb-4 p-3 bg-black/20 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Monthly Usage:</span>
          <span className="text-white">
            {user.monthlyUsage} / {user.subscriptionTier === 'pro' ? '∞' : '5'}
          </span>
        </div>
        {user.subscriptionTier === 'free' && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((user.monthlyUsage / 5) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {!currentSession ? (
        <button
          onClick={onStartSession}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Start New Session</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>Active Session</span>
          </div>

          {/* Curated Items */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300">
              Curated Items ({curatedItems.length})
            </h4>
            {curatedItems.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Highlight text on Reddit to start curating...
              </p>
            ) : (
              curatedItems.map((item) => (
                <div key={item.itemId} className="p-2 bg-black/20 rounded text-xs">
                  <p className="text-white line-clamp-2">{item.text}</p>
                  <p className="text-gray-400 mt-1">from {item.threadTitle}</p>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          {curatedItems.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={onGenerateDocument}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Generate Document</span>
              </button>

              {user.subscriptionTier === 'pro' && curatedItems.length >= 2 && (
                <button
                  onClick={onSynthesizeInsights}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Synthesis</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400">
          💡 Tip: Select text in the Reddit thread on the left to add it to your curation.
        </p>
      </div>
    </div>
  );
}