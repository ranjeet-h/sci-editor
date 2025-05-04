import { Document, HistoryItem, Variable } from './index';

// Create a new document with default values
export const createNewDocument = (title = 'Untitled'): Document => {
  // Ensure truly unique ID with timestamp and random string
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const id = `doc_${timestamp}_${randomId}`;
  
  console.log(`Creating new document: "${title}" with ID: ${id}`);
  
  return {
    id,
    title,
    content: '',
    variables: [],
    history: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

// Get a document preview (first 60 characters)
export const getDocumentPreview = (content: string): string => {
  if (!content) return 'Empty document';
  
  // Remove any plot commands
  const contentWithoutPlots = content.replace(/plot\([^)]*\)/g, '');
  
  // Get first 60 characters of content
  const preview = contentWithoutPlots.trim().substring(0, 60);
  
  return preview + (contentWithoutPlots.length > 60 ? '...' : '');
};

// Format date for display
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 