// Create custom types instead of importing from ace-builds
interface Completion {
  caption: string;
  value: string;
  meta: string;
  score?: number;
  docText?: string;
}

interface Completer {
  getCompletions: (
    editor: any,
    session: any,
    pos: { row: number; column: number },
    prefix: string,
    callback: (err: any, completions: Completion[]) => void
  ) => void;
}

interface AICompleterOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  apiEndpoint?: string;
  provider?: 'openai' | 'anthropic' | 'custom';
}

// Default options
const defaultOptions: AICompleterOptions = {
  model: 'gpt-3.5-turbo-instruct',
  maxTokens: 100,
  temperature: 0.5,
  provider: 'openai'
};

// Define the custom properties for our AICompleter
interface AICompleter extends Completer {
  _sciEditorCustom: boolean;
  options: AICompleterOptions;
  getCompletions: (
    editor: any,
    session: any,
    pos: { row: number; column: number },
    prefix: string,
    callback: (err: any, completions: Completion[]) => void
  ) => void;
  getInlineCompletion: (
    editor: any,
    session: any,
    pos: { row: number; column: number }
  ) => Promise<string | null>;
}

/**
 * AI text completion provider similar to GitHub Copilot
 */
export const createAICompleter = (options: AICompleterOptions = {}): AICompleter => {
  const completerOptions = { ...defaultOptions, ...options };
  
  // Function to get context around the cursor
  const getContext = (editor: any, session: any, pos: { row: number; column: number }) => {
    const document = session.getDocument();
    const currentLine = document.getLine(pos.row);
    const textBeforeCursor = currentLine.substring(0, pos.column);
    
    // Get a few lines before for context (up to 10 lines)
    const startRow = Math.max(0, pos.row - 10);
    const contextLines = [];
    
    for (let i = startRow; i < pos.row; i++) {
      contextLines.push(document.getLine(i));
    }
    
    contextLines.push(textBeforeCursor);
    
    return {
      prefix: textBeforeCursor,
      context: contextLines.join('\n')
    };
  };
  
  // Function to fetch completion from API
  const fetchCompletion = async (context: string, prefix: string): Promise<string | null> => {
    if (!completerOptions.apiKey) {
      console.warn('API key not provided for AI completion');
      return null;
    }
    
    try {
      // Request body based on provider
      let requestBody: any;
      let apiUrl: string;
      
      if (completerOptions.provider === 'openai') {
        apiUrl = completerOptions.apiEndpoint || 'https://api.openai.com/v1/completions';
        requestBody = {
          model: completerOptions.model,
          prompt: context,
          max_tokens: completerOptions.maxTokens,
          temperature: completerOptions.temperature,
          stop: ['\n\n']
        };
      } else if (completerOptions.provider === 'anthropic') {
        apiUrl = completerOptions.apiEndpoint || 'https://api.anthropic.com/v1/complete';
        requestBody = {
          prompt: `\n\nHuman: ${context}\n\nAssistant:`,
          model: completerOptions.model || 'claude-2',
          max_tokens_to_sample: completerOptions.maxTokens,
          temperature: completerOptions.temperature
        };
      } else {
        // Custom provider
        apiUrl = completerOptions.apiEndpoint || '';
        requestBody = {
          context,
          prefix,
          max_tokens: completerOptions.maxTokens,
          temperature: completerOptions.temperature
        };
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add the appropriate authorization header based on provider
      if (completerOptions.provider === 'openai') {
        headers['Authorization'] = `Bearer ${completerOptions.apiKey}`;
      } else if (completerOptions.provider === 'anthropic') {
        headers['x-api-key'] = completerOptions.apiKey || '';
      } else {
        headers['Authorization'] = `Bearer ${completerOptions.apiKey}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error('API error:', await response.text());
        return null;
      }
      
      const data = await response.json();
      
      // Extract completion based on provider
      let completion = '';
      if (completerOptions.provider === 'openai') {
        completion = data.choices && data.choices[0] ? data.choices[0].text : '';
      } else if (completerOptions.provider === 'anthropic') {
        completion = data.completion || '';
      } else {
        completion = data.completion || data.text || '';
      }
      
      return completion;
    } catch (error) {
      console.error('Error fetching AI completion:', error);
      return null;
    }
  };
  
  const aiCompleter: AICompleter = {
    _sciEditorCustom: true,
    options: completerOptions,
    
    // For dropdown completions interface (not primary use case)
    getCompletions: (
      editor: any,
      session: any,
      pos: { row: number; column: number },
      prefix: string,
      callback: (err: any, completions: Completion[]) => void
    ) => {
      // This AI completer is primarily for inline completion,
      // but we implement the getCompletions method for compatibility
      callback(null, []);
    },
    
    // Primary method for getting inline completions
    getInlineCompletion: async (
      editor: any,
      session: any,
      pos: { row: number; column: number }
    ): Promise<string | null> => {
      const { prefix, context } = getContext(editor, session, pos);
      
      // Only fetch completion if there's enough context
      if (context.length < 5) {
        return null;
      }
      
      return await fetchCompletion(context, prefix);
    }
  };
  
  return aiCompleter;
}; 