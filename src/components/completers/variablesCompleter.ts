import { Completer, Completion } from 'ace-builds';
import { Variable } from '../../types';

// Define the custom properties for our VariablesCompleter
interface VariablesCompleter extends Completer {
  _sciEditorCustom: boolean;
  variables: Variable[];
  getCompletions: (
    editor: any,
    session: any,
    pos: { row: number; column: number },
    prefix: string,
    callback: (err: any, completions: Completion[]) => void
  ) => void;
}

// The variables completer for Ace editor
export const variablesCompleter: VariablesCompleter = {
  // Custom property to identify this completer
  _sciEditorCustom: true,
  
  // This will be populated from the parent component
  variables: [],
  
  getCompletions: (
    editor: any,
    session: any,
    pos: { row: number; column: number },
    prefix: string,
    callback: (err: any, completions: Completion[]) => void
  ) => {
    // If prefix is empty or too short, don't show completions
    if (!prefix || prefix.length < 1) {
      callback(null, []);
      return;
    }
    
    // Get the current line text
    const lineText = session.getLine(pos.row);
    
    // Check if we're in an appropriate context (not in a string, comment, etc.)
    // This is a simple implementation - could be enhanced for more accuracy
    
    // Filter variables that match the prefix
    const matchingVariables = variablesCompleter.variables.filter((variable: Variable) => 
      variable.name.toLowerCase().indexOf(prefix.toLowerCase()) !== -1
    );
    
    // Convert to Ace Completion format
    const completions = matchingVariables.map((variable: Variable) => {
      // Format the value for display
      let formattedValue = '';
      
      try {
        if (typeof variable.value === 'object') {
          formattedValue = JSON.stringify(variable.value);
        } else {
          formattedValue = String(variable.value);
        }
        
        // Truncate if too long
        if (formattedValue.length > 30) {
          formattedValue = formattedValue.substring(0, 27) + '...';
        }
      } catch (e) {
        formattedValue = '[complex value]';
      }
      
      return {
        caption: variable.name,
        value: variable.name,
        meta: variable.type || 'variable',
        score: 1100, // Higher than math functions to prioritize
        docText: `${variable.name} = ${formattedValue}`
      };
    });
    
    callback(null, completions);
  }
}; 