import React, { useEffect, useState } from 'react';

interface AIInlineCompletionsProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  apiKey: string;
  onAccept?: (completion: string) => void;
  provider?: 'openai' | 'anthropic' | 'custom';
  model?: string;
  apiEndpoint?: string;
}

interface Position {
  top: number;
  left: number;
}

const AIInlineCompletions: React.FC<AIInlineCompletionsProps> = ({
  editorRef,
  apiKey,
  onAccept,
  provider = 'openai',
  model,
  apiEndpoint,
}) => {
  const [completion, setCompletion] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCursorPos, setLastCursorPos] = useState<{ row: number; column: number } | null>(null);
  
  // Keep track of the last text to avoid redundant completions
  const [lastText, setLastText] = useState('');
  
  // Debounced function to fetch completions
  const debouncedFetchCompletion = useDebounce(fetchCompletion, 500);
  
  // Function to get context from the editor
  const getEditorContext = () => {
    if (!editorRef.current) return null;
    
    const textarea = editorRef.current;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    
    // Get text before cursor
    const textBeforeCursor = value.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];
    const currentColumn = lines[currentLineIndex].length;
    
    // Get a reasonable amount of context (last 10 lines)
    const contextLines = lines.slice(Math.max(0, lines.length - 10));
    
    // Update the last cursor position
    setLastCursorPos({ row: currentLineIndex, column: currentColumn });
    
    return {
      text: textBeforeCursor,
      lines: contextLines,
      position: { row: currentLineIndex, column: currentColumn },
      currentLine
    };
  };
  
  // Function to calculate the position for displaying the completion
  const calculateCompletionPosition = () => {
    if (!editorRef.current || !lastCursorPos) return null;
    
    const textarea = editorRef.current;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 20;
    const paddingLeft = parseFloat(getComputedStyle(textarea).paddingLeft) || 24;
    
    // Create a temporary span to measure text width up to cursor
    const tempSpan = document.createElement('span');
    tempSpan.style.font = getComputedStyle(textarea).font;
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'pre';
    
    // Get the current line's text
    const value = textarea.value;
    const lines = value.split('\n');
    const currentLine = lines[lastCursorPos.row];
    
    if (!currentLine) return null;
    
    // Text up to cursor position
    tempSpan.textContent = currentLine.substring(0, lastCursorPos.column);
    document.body.appendChild(tempSpan);
    
    // Calculate position
    const top = paddingTop + (lastCursorPos.row * lineHeight);
    const left = paddingLeft + tempSpan.offsetWidth;
    
    // Clean up
    document.body.removeChild(tempSpan);
    
    return { top, left };
  };
  
  // Effect to track editor changes and request completions
  useEffect(() => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    
    const handleInput = () => {
      const context = getEditorContext();
      if (!context) return;
      
      // Avoid requesting a completion if the text hasn't changed significantly
      if (Math.abs(context.text.length - lastText.length) < 5) return;
      
      setLastText(context.text);
      
      // Only fetch completion if we have enough context
      if (context.text.length > 10) {
        debouncedFetchCompletion(context);
      } else {
        setCompletion(null);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab to accept the completion
      if (e.key === 'Tab' && completion && !e.shiftKey) {
        e.preventDefault();
        acceptCompletion();
      }
      
      // Escape to dismiss
      if (e.key === 'Escape' && completion) {
        e.preventDefault();
        dismissCompletion();
      }
      
      // Arrow keys to dismiss
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && completion) {
        dismissCompletion();
      }
    };
    
    // Track cursor movements
    const handleSelectionChange = () => {
      const context = getEditorContext();
      if (!context) return;
      
      // If cursor moved to a different line, dismiss completion
      if (lastCursorPos && lastCursorPos.row !== context.position.row) {
        dismissCompletion();
      }
      
      // Update position for completion display
      const newPosition = calculateCompletionPosition();
      if (newPosition) {
        setPosition(newPosition);
      }
    };
    
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('click', handleSelectionChange);
    
    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('click', handleSelectionChange);
    };
  }, [editorRef, completion, lastCursorPos, lastText, debouncedFetchCompletion]);
  
  // Function to accept the current completion
  const acceptCompletion = () => {
    if (!completion || !editorRef.current) return;
    
    const textarea = editorRef.current;
    const selectionStart = textarea.selectionStart;
    const value = textarea.value;
    
    // Insert the completion at the cursor position
    const newValue = value.substring(0, selectionStart) + completion + value.substring(selectionStart);
    
    // Update the textarea value
    if (onAccept) {
      onAccept(newValue);
    } else {
      // Direct update if no onAccept handler provided
      textarea.value = newValue;
      
      // Set cursor position after the inserted completion
      const newCursorPos = selectionStart + completion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }
    
    // Clear the completion
    setCompletion(null);
  };
  
  // Function to dismiss the current completion
  const dismissCompletion = () => {
    setCompletion(null);
  };
  
  // Async function to fetch completions from the API
  async function fetchCompletion(context: any) {
    if (!apiKey) return;
    
    setIsLoading(true);
    
    try {
      // Request body based on provider
      let requestBody: any;
      let url: string;
      
      if (provider === 'openai') {
        url = apiEndpoint || 'https://api.openai.com/v1/completions';
        requestBody = {
          model: model || 'gpt-3.5-turbo-instruct',
          prompt: context.text,
          max_tokens: 50,
          temperature: 0.5,
          stop: ['\n\n', '\n']
        };
      } else if (provider === 'anthropic') {
        url = apiEndpoint || 'https://api.anthropic.com/v1/complete';
        requestBody = {
          prompt: `\n\nHuman: ${context.text}\n\nAssistant:`,
          model: model || 'claude-2',
          max_tokens_to_sample: 50,
          temperature: 0.5
        };
      } else {
        // Custom provider
        url = apiEndpoint || '';
        requestBody = {
          context: context.text,
          max_tokens: 50,
          temperature: 0.5
        };
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add the appropriate authorization header based on provider
      if (provider === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (provider === 'anthropic') {
        headers['x-api-key'] = apiKey;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error('API error:', await response.text());
        setCompletion(null);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Extract completion based on provider
      let completionText = '';
      if (provider === 'openai') {
        completionText = data.choices && data.choices[0] ? data.choices[0].text : '';
      } else if (provider === 'anthropic') {
        completionText = data.completion || '';
      } else {
        completionText = data.completion || data.text || '';
      }
      
      // Update state with the completion
      setCompletion(completionText);
      
      // Calculate position for displaying the completion
      const newPosition = calculateCompletionPosition();
      if (newPosition) {
        setPosition(newPosition);
      }
    } catch (error) {
      console.error('Error fetching AI completion:', error);
      setCompletion(null);
    } finally {
      setIsLoading(false);
    }
  }
  
  // If no completion or position, don't render anything
  if (!completion || !position) return null;
  
  return (
    <div 
      className="ai-inline-completion"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        color: 'rgba(128, 128, 128, 0.8)',
        pointerEvents: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        whiteSpace: 'pre'
      }}
    >
      {completion}
      {isLoading && (
        <span className="loading-indicator">...</span>
      )}
    </div>
  );
};

// Utility function for debouncing
function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      func(...args);
    }, delay);
    
    setTimeoutId(id);
  };
}

export default AIInlineCompletions; 