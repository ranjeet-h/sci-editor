export interface Suggestion {
  value: string;
  variableValue?: string; // Value of the variable (for displaying after equals sign)
  lineIndex: number;
  position: {
    start: number;
    end: number;
  };
  isVariable?: boolean; // Whether this is a variable suggestion
}

export interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

export interface Variable {
  name: string;
  value: any;
  type: string;
}

export interface PlotItem {
  id: string;
  command: string;
  lineIndex: number;
}

// Tag related types
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  variables: Variable[];
  history: HistoryItem[];
  createdAt: number;
  updatedAt: number;
  tags?: string[]; // Array of tag IDs
  categoryId?: string; // Optional category ID
}

export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview: string;
  tags?: string[];
  categoryId?: string;
}

export interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  isLoading: boolean;
  error: string | null;
} 