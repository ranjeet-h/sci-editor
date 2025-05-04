import React, { useState, useEffect, useRef } from 'react';
import { Document, DocumentMetadata } from '../types';
import { createNewDocument, getDocumentPreview, formatDate } from '../types/Document';
import './DocumentManager.css';

interface DocumentManagerProps {
  documents: Document[];
  activeDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
  onDocumentCreate: () => void;
  onDocumentDelete: (documentId: string) => void;
  onDocumentRename: (documentId: string, newTitle: string) => void;
  onClose?: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  activeDocumentId,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentRename,
  onClose
}) => {
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingId]);

  useEffect(() => {
    // Generate metadata from documents
    try {
      const metadata = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        preview: getDocumentPreview(doc.content)
      }));
      
      setDocumentMetadata(metadata);
    } catch (error) {
      console.error('Error generating document metadata:', error);
      setStatusMessage({
        text: 'Error loading documents',
        type: 'error'
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [documents]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const filteredDocuments = documentMetadata.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRenameStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
  };

  const handleRenameComplete = (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setStatusMessage({
        text: 'Document name cannot be empty',
        type: 'error'
      });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    // Check for duplicate names
    const duplicateName = documentMetadata.some(doc => 
      doc.id !== id && doc.title.toLowerCase() === newTitle.trim().toLowerCase()
    );
    
    if (duplicateName) {
      setStatusMessage({
        text: 'A document with this name already exists',
        type: 'error'
      });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    onDocumentRename(id, newTitle.trim());
    setRenamingId(null);
    setStatusMessage({
      text: 'Document renamed successfully',
      type: 'success'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRenameKeyDown = (id: string, newTitle: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameComplete(id, newTitle);
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = (id: string) => {
    onDocumentDelete(id);
    setConfirmDeleteId(null);
    setStatusMessage({
      text: 'Document deleted successfully',
      type: 'success'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateDocument = () => {
    setIsCreatingDocument(true);
    
    try {
      onDocumentCreate();
      
      setStatusMessage({
        text: 'New document created',
        type: 'success'
      });
    } catch (error) {
      setStatusMessage({
        text: 'Failed to create document',
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setStatusMessage(null);
        setIsCreatingDocument(false);
      }, 3000);
    }
  };

  return (
    <div className="document-manager">
      <div className="document-manager-header">
        <h3>Document Manager</h3>
        {onClose && (
          <button 
            className="close-document-manager-btn" 
            onClick={onClose}
            aria-label="Close document manager"
          >
            ×
          </button>
        )}
      </div>
      
      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="document-manager-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="document-search"
            aria-label="Search documents"
          />
          {isSearching && <span className="search-indicator">Searching...</span>}
        </div>
        <button 
          className={`new-document-btn ${isCreatingDocument ? 'creating' : ''}`}
          onClick={handleCreateDocument}
          aria-label="Create new document"
          disabled={isCreatingDocument}
        >
          <span className="new-doc-icon">{isCreatingDocument ? '⏳' : '+'}</span>
          {isCreatingDocument ? 'Creating...' : 'New Document'}
        </button>
      </div>
      
      <div className="documents-list">
        {filteredDocuments.length === 0 ? (
          <div className="empty-documents">
            {searchTerm ? 'No documents match your search' : 'No documents yet'}
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <div 
              key={doc.id} 
              className={`document-item ${doc.id === activeDocumentId ? 'active' : ''}`}
              onClick={() => {
                onDocumentSelect(doc.id);
                setStatusMessage({
                  text: `Switched to "${doc.title}"`,
                  type: 'success'
                });
                setTimeout(() => setStatusMessage(null), 3000);
              }}
            >
              <div className="document-info">
                {renamingId === doc.id ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    className="rename-input"
                    defaultValue={doc.title}
                    onBlur={(e) => handleRenameComplete(doc.id, e.target.value)}
                    onKeyDown={(e) => handleRenameKeyDown(doc.id, e.currentTarget.value, e)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Rename document"
                  />
                ) : (
                  <h4 className="document-title">{doc.title} 
                    <span className="document-id">{doc.id.substring(0, 8)}</span>
                  </h4>
                )}
                <p className="document-preview">{doc.preview}</p>
                <p className="document-date">{formatDate(doc.updatedAt)}</p>
              </div>
              
              <div className="document-actions">
                <button 
                  className="rename-btn"
                  onClick={(e) => handleRenameStart(doc.id, e)}
                  aria-label="Rename document"
                >
                  Rename
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteClick(doc.id, e)}
                  aria-label="Delete document"
                >
                  Delete
                </button>
              </div>
              
              {confirmDeleteId === doc.id && (
                <div className="delete-confirmation">
                  <p>Delete "{doc.title}"?</p>
                  <div className="confirmation-actions">
                    <button 
                      className="confirm-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(doc.id);
                      }}
                    >
                      Yes, delete
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentManager; 