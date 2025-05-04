import React, { useState } from 'react';
import { Document } from '../types';
import './DocumentExport.css';
import LatexExport from './LatexExport';

interface DocumentExportProps {
  documents: Document[];
  activeDocument: Document | null;
  allTags: Array<{ id: string; name: string; color: string }>;
  allCategories: Array<{ id: string; name: string }>;
  onExportComplete: () => void;
  onImportComplete: (importedDocs: Document[]) => void;
  onClose: () => void;
}

const DocumentExport: React.FC<DocumentExportProps> = ({
  documents,
  activeDocument,
  allTags,
  allCategories,
  onExportComplete,
  onImportComplete,
  onClose,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    activeDocument ? [activeDocument.id] : []
  );
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'md' | 'latex'>('json');
  const [showLatexExport, setShowLatexExport] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Toggle document selection
  const toggleDocSelection = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(selectedDocIds.filter(id => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  // Select all documents
  const selectAllDocs = () => {
    setSelectedDocIds(documents.map(doc => doc.id));
  };

  // Deselect all documents
  const deselectAllDocs = () => {
    setSelectedDocIds([]);
  };

  // Get the proper tag or category name from its ID
  const getTagName = (tagId: string) => {
    const tag = allTags.find(t => t.id === tagId);
    return tag ? tag.name : 'Unknown Tag';
  };

  const getCategoryName = (categoryId: string) => {
    const category = allCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Export documents based on selected format
  const handleExport = () => {
    if (selectedDocIds.length === 0) return;

    if (exportFormat === 'latex' && selectedDocIds.length === 1) {
      // For LaTeX, show the LaTeX export dialog
      setShowLatexExport(true);
      return;
    }

    const docsToExport = documents.filter(doc => selectedDocIds.includes(doc.id));
    let exportContent = '';
    let fileName = '';
    let fileType = '';

    switch (exportFormat) {
      case 'json':
        exportContent = JSON.stringify(docsToExport, null, 2);
        fileName = 'sci-notepad-export.json';
        fileType = 'application/json';
        break;

      case 'txt':
        exportContent = docsToExport
          .map(doc => {
            return `# ${doc.title}\n\n${doc.content}\n\n---\n`;
          })
          .join('\n');
        fileName = 'sci-notepad-export.txt';
        fileType = 'text/plain';
        break;

      case 'md':
        exportContent = docsToExport
          .map(doc => {
            let mdContent = `# ${doc.title}\n\n`;
            
            // Add tags if they exist
            if (doc.tags && doc.tags.length > 0) {
              mdContent += 'Tags: ' + doc.tags.map(tagId => `#${getTagName(tagId)}`).join(', ') + '\n\n';
            }
            
            // Add category if it exists
            if (doc.categoryId) {
              mdContent += `Category: ${getCategoryName(doc.categoryId)}\n\n`;
            }
            
            // Add creation and update dates
            mdContent += `Created: ${new Date(doc.createdAt).toLocaleString()}\n`;
            mdContent += `Updated: ${new Date(doc.updatedAt).toLocaleString()}\n\n`;
            
            // Add document content
            mdContent += `${doc.content}\n\n---\n`;
            
            return mdContent;
          })
          .join('\n');
        fileName = 'sci-notepad-export.md';
        fileType = 'text/markdown';
        break;
    }

    // Create a blob with the export content
    const blob = new Blob([exportContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onExportComplete();
  };

  // Handle file import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Try to parse as JSON
        const importedDocs = JSON.parse(content);
        
        // Validate imported documents
        if (!Array.isArray(importedDocs)) {
          throw new Error('Invalid import format. Expected an array of documents.');
        }
        
        // Check if documents have required fields
        const validDocs = importedDocs.filter(doc => {
          return doc.id && doc.title && typeof doc.content === 'string';
        });
        
        if (validDocs.length === 0) {
          throw new Error('No valid documents found in the import file.');
        }
        
        // Import the documents
        onImportComplete(validDocs);
        onClose();
        
      } catch (error) {
        console.error('Import error:', error);
        setImportError('Failed to import documents. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="document-export-modal">
      <div className="document-export-content">
        <h2>Import & Export Documents</h2>
        
        <div className="export-section">
          <h3>Export Documents</h3>
          
          <div className="export-controls">
            <div className="export-format">
              <label>Export Format:</label>
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value as any)}
              >
                <option value="json">JSON (Full Data)</option>
                <option value="txt">Plain Text</option>
                <option value="md">Markdown</option>
                <option value="latex">LaTeX (Single document only)</option>
              </select>
              
              {exportFormat === 'latex' && selectedDocIds.length > 1 && (
                <div className="export-warning">
                  LaTeX export supports only one document at a time.
                </div>
              )}
            </div>
            
            <div className="document-selection">
              <div className="selection-header">
                <div className="selection-title">Select Documents to Export:</div>
                <div className="selection-actions">
                  <button onClick={selectAllDocs}>Select All</button>
                  <button onClick={deselectAllDocs}>Deselect All</button>
                </div>
              </div>
              
              <div className="documents-list">
                {documents.map(doc => (
                  <div 
                    key={doc.id}
                    className={`document-item ${selectedDocIds.includes(doc.id) ? 'selected' : ''}`}
                    onClick={() => toggleDocSelection(doc.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() => {}} // Handled by the div click
                    />
                    <div className="document-info">
                      <div className="document-title">{doc.title}</div>
                      <div className="document-meta">
                        {doc.updatedAt && (
                          <span className="document-date">
                            Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                        {doc.tags && doc.tags.length > 0 && (
                          <span className="document-tags">
                            Tags: {doc.tags.map(tagId => getTagName(tagId)).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="export-button"
              onClick={handleExport}
              disabled={selectedDocIds.length === 0 || (exportFormat === 'latex' && selectedDocIds.length > 1)}
            >
              Export Selected Documents
            </button>
          </div>
        </div>
        
        <div className="import-section">
          <h3>Import Documents</h3>
          
          <div className="import-controls">
            <p className="import-info">
              Import documents from a JSON file previously exported from SciNotepad.
              Documents with the same ID will be updated, new ones will be added.
            </p>
            
            <label className="import-file-label">
              <span>Select File to Import:</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileSelect}
              />
            </label>
            
            {importError && (
              <div className="import-error">
                {importError}
              </div>
            )}
          </div>
        </div>
        
        <div className="document-export-footer">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      
      {showLatexExport && activeDocument && (
        <LatexExport
          documentContent={activeDocument.content}
          documentTitle={activeDocument.title}
          onClose={() => setShowLatexExport(false)}
        />
      )}
    </div>
  );
};

export default DocumentExport; 