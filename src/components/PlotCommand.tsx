import React from 'react';
import Plot from './Plot';
import './PlotCommand.css';

interface PlotCommandProps {
  command: string;
  onClose?: () => void;
  variables?: { [key: string]: any };
}

interface PlotParams {
  expression: string;
  xMin?: number;
  xMax?: number;
  points?: number;
  title?: string;
}

type ParseResult = 
  | { success: true; params: PlotParams }
  | { success: false; error: string };

const PlotCommand: React.FC<PlotCommandProps> = ({ command, onClose, variables = {} }) => {
  // Extract plot parameters from command
  // Format: plot(expression, xMin, xMax, points, title)
  // e.g., plot(sin(x), -10, 10, 100, "Sine Function")
  const parseCommand = (): ParseResult => {
    try {
      // Extract content inside plot()
      const plotRegex = /^plot\s*\(\s*(.*)\s*\)$/;
      const match = command.match(plotRegex);
      
      if (!match) {
        throw new Error('Invalid plot command format');
      }
      
      // Split by commas but respect nested functions
      const args = splitArguments(match[1]);
      
      if (args.length === 0 || args.length > 5) {
        throw new Error('Invalid number of arguments for plot command');
      }
      
      const expression = args[0].trim();
      if (!expression) {
        throw new Error('Expression is required');
      }
      
      // Parse optional arguments
      const params: PlotParams = { expression };
      
      if (args.length > 1) {
        const xMin = parseFloat(args[1]);
        if (!isNaN(xMin)) params.xMin = xMin;
      }
      
      if (args.length > 2) {
        const xMax = parseFloat(args[2]);
        if (!isNaN(xMax)) params.xMax = xMax;
      }
      
      if (args.length > 3) {
        const points = parseInt(args[3], 10);
        if (!isNaN(points)) params.points = points;
      }
      
      if (args.length > 4) {
        // Remove quotes from title if present
        const title = args[4].trim().replace(/^["'](.*)["']$/, '$1');
        params.title = title;
      }
      
      return { success: true, params };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error parsing plot command'
      };
    }
  };
  
  // Helper to split arguments, respecting function parentheses
  const splitArguments = (argsString: string): string[] => {
    const result: string[] = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      
      if (char === '(') {
        depth++;
        current += char;
      } else if (char === ')') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current);
    }
    
    return result;
  };
  
  const parsed = parseCommand();
  
  if (!parsed.success) {
    return (
      <div className="plot-error-container">
        <div className="plot-error">Error: {parsed.error}</div>
      </div>
    );
  }
  
  return (
    <Plot
      expression={parsed.params.expression}
      xMin={parsed.params.xMin}
      xMax={parsed.params.xMax}
      points={parsed.params.points}
      title={parsed.params.title}
      variables={variables}
      onClose={onClose}
    />
  );
};

export default PlotCommand; 