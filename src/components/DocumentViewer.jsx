import React from 'react';
import { FileText, ExternalLink, Sparkles, Download } from 'lucide-react';
import { format } from 'date-fns';

export function DocumentViewer({ documents, user }) {
  const downloadDocument = (doc) => {
    let content = `# ${doc.title}\n\nGenerated on ${format(new Date(doc.createdAt), 'PPP')}\n\n`;
    
    if (doc.type === 'synthesis') {
      content += `## Key Themes\n\n`;
      doc.themes.forEach((theme, index) => {
        content += `${index + 1}. ${theme}\n`;
      });
      
      content += `\n## AI Insights\n\n`;
      doc.insights.forEach((insight, index) => {
        content += `- ${insight}\n`;
      });
      
      content += `\n## Source Content\n\n`;
    }
    
    doc.items.forEach((item, index) => {
      content += `### Item ${index + 1}\n\n`;
      content += `**Source:** [${item.threadTitle}](${item.sourceUrl})\n\n`;
      content += `${item.text}\n\n`;
      content += `*Highlighted on ${format(new Date(item.highlightedAt), 'PPp')}*\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="card-gradient rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
        <p className="text-gray-300">Sign in to view your curated documents.</p>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
      
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No documents yet</p>
          <p className="text-sm text-gray-400">
            Start a curation session to create your first document
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 bg-black/20 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    {doc.type === 'synthesis' && (
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {format(new Date(doc.createdAt), 'PPp')}
                  </p>
                </div>
                <button
                  onClick={() => downloadDocument(doc)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Download as Markdown"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-gray-300 mb-3">
                {doc.items.length} curated item{doc.items.length !== 1 ? 's' : ''}
              </div>

              {doc.type === 'synthesis' && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-purple-400 mb-2">AI Insights:</h5>
                  {doc.insights?.slice(0, 2).map((insight, index) => (
                    <p key={index} className="text-xs text-gray-300 mb-1">
                      • {insight}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {doc.items.slice(0, 2).map((item) => (
                  <div key={item.itemId} className="text-xs">
                    <p className="text-gray-300 line-clamp-2 mb-1">{item.text}</p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
                {doc.items.length > 2 && (
                  <p className="text-xs text-gray-400">
                    +{doc.items.length - 2} more items...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}