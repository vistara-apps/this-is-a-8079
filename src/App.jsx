import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExtensionPopup } from './components/ExtensionPopup';
import { DocumentViewer } from './components/DocumentViewer';
import { RedditThreadSimulator } from './components/RedditThreadSimulator';
import { useRedditDigest } from './hooks/useRedditDigest';

function App() {
  const [activeView, setActiveView] = useState('extension');
  const {
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
  } = useRedditDigest();

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        user={user}
        onLogin={login}
        onLogout={logout}
        onUpgrade={upgradeTosPro}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reddit Thread Simulator */}
          <div className="lg:col-span-2">
            <RedditThreadSimulator 
              onTextHighlighted={addCuratedItem}
              isSessionActive={!!currentSession}
            />
          </div>
          
          {/* Extension Popup */}
          <div className="lg:col-span-1">
            {activeView === 'extension' && (
              <ExtensionPopup
                user={user}
                currentSession={currentSession}
                curatedItems={curatedItems}
                onStartSession={startNewSession}
                onGenerateDocument={generateDocument}
                onSynthesizeInsights={synthesizeInsights}
              />
            )}
            
            {activeView === 'documents' && (
              <DocumentViewer
                documents={documents}
                user={user}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;