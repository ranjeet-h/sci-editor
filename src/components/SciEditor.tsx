import React, { useEffect, useRef, useState } from 'react';
import { Suggestion } from '../types';
import './SciEditor.css';

interface SciEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  suggestion: Suggestion | null;
  variables: Array<{ name: string; value: any; type: string }>;
  height?: string;
  width?: string;
  editorRef?: React.RefObject<any>;
  placeholder?: string;
}

interface Position {
  top: number;
  left: number;
}

const SciEditor: React.FC<SciEditorProps> = ({
  value,
  onChange,
  onKeyDown,
  suggestion,
  variables,
  height = '100%',
  width = '100%',
  editorRef,
  placeholder = "Scientific Notepad Editor",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestionPos, setSuggestionPos] = useState<Position | null>(null);

  // Connect internal ref to external ref if provided
  useEffect(() => {
    if (editorRef && textareaRef.current) {
      // @ts-ignore - Connect the current textarea instance to the parent's ref
      editorRef.current = textareaRef.current;
    }
  }, [editorRef]);

  // Calculate position for the suggestion when it changes
  useEffect(() => {
    if (!suggestion || !textareaRef.current) {
      setSuggestionPos(null);
      return;
    }
    
    const textarea = textareaRef.current;
    const lines = value.split('\n');
    const line = lines[suggestion.lineIndex];
    
    if (!line) {
      setSuggestionPos(null);
      return;
    }
    
    // Different positioning logic based on suggestion type
    if (suggestion.isVariable) {
      // For variable suggestions, position at the cursor
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
      const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 20;
      const paddingLeft = parseFloat(getComputedStyle(textarea).paddingLeft) || 24;
      
      // Create temp span to measure text width up to cursor
      const tempSpan = document.createElement('span');
      tempSpan.style.font = getComputedStyle(textarea).font;
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = line.substring(0, suggestion.position.start);
      document.body.appendChild(tempSpan);
      
      // Calculate position
      const top = paddingTop + (suggestion.lineIndex * lineHeight);
      const left = paddingLeft + tempSpan.offsetWidth;
      
      // Clean up
      document.body.removeChild(tempSpan);
      
      setSuggestionPos({ top, left });
    } else {
      // For equation results, position after equals sign (existing logic)
      const equalsIndex = line.lastIndexOf('=');
      if (equalsIndex === -1) {
        setSuggestionPos(null);
        return;
      }
      
      // If there's already content after the equals sign, don't show suggestion
      const textAfterEquals = line.substring(equalsIndex + 1).trim();
      if (textAfterEquals.length > 0) {
        setSuggestionPos(null);
        return;
      }
      
      // Calculate position for the suggestion
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
      const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 20;
      const paddingLeft = parseFloat(getComputedStyle(textarea).paddingLeft) || 24;
      
      // Create temp span to measure text width
      const tempSpan = document.createElement('span');
      tempSpan.style.font = getComputedStyle(textarea).font;
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = line.substring(0, equalsIndex + 1); // Include equals sign
      document.body.appendChild(tempSpan);
      
      // Calculate position
      const top = paddingTop + (suggestion.lineIndex * lineHeight);
      const left = paddingLeft + tempSpan.offsetWidth;
      
      // Clean up
      document.body.removeChild(tempSpan);
      
      setSuggestionPos({ top, left });
    }
  }, [suggestion, value]);

  // Handle accepting the suggestion
  const handleAcceptSuggestion = () => {
    if (suggestion && textareaRef.current) {
      // Simulate Tab key press
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true
      });
      textareaRef.current.dispatchEvent(tabEvent);
    }
  };

  // Handle rejecting the suggestion
  const handleRejectSuggestion = () => {
    if (suggestion && textareaRef.current) {
      // Simulate Escape key press
      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true
      });
      textareaRef.current.dispatchEvent(escEvent);
    }
  };

  return (
    <div className="sci-editor-container">
      <textarea
        ref={textareaRef}
        className="sci-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      
      {suggestion && suggestionPos && (
        <div 
          className="inline-ghost-suggestion"
          style={{
            top: `${suggestionPos.top + 2}px`,
            left: `${suggestionPos.left + 8}px`,
          }}
        >
          {suggestion.isVariable 
            ? `${suggestion.value} (=${suggestion.variableValue})` 
            : suggestion.value
          }
          <div className="suggestion-help">
            <span className="hint-text">Press <kbd>Tab</kbd> to accept or <kbd>Esc</kbd> to dismiss</span>
            <div className="suggestion-actions">
              <button 
                className="accept-btn" 
                onClick={handleAcceptSuggestion}
                aria-label="Accept suggestion"
              >
                Accept
              </button>
              <button 
                className="reject-btn" 
                onClick={handleRejectSuggestion}
                aria-label="Reject suggestion"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SciEditor; 