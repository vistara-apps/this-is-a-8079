import React from 'react';
import { Brain, FileText, Settings, Crown } from 'lucide-react';

export function Header({ user, onLogin, onLogout, onUpgrade, activeView, onViewChange }) {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">
              Reddit <span className="text-gradient">Digest</span>
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onViewChange('extension')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeView === 'extension'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Extension
            </button>
            <button
              onClick={() => onViewChange('documents')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeView === 'documents'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Documents
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">{user.email}</span>
                  {user.subscriptionTier === 'pro' ? (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <button
                      onClick={onUpgrade}
                      className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:scale-105 transition-transform"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const email = prompt('Enter your email to get started:');
                  if (email) onLogin(email);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:scale-105 transition-transform"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}