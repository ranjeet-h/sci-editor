import { Completer, Completion } from 'ace-builds';

// List of mathematical functions from mathjs
const mathFunctions = [
  // Basic arithmetic
  { name: 'abs', description: 'Absolute value', meta: 'function' },
  { name: 'add', description: 'Addition', meta: 'function' },
  { name: 'cbrt', description: 'Cube root', meta: 'function' },
  { name: 'ceil', description: 'Ceiling function', meta: 'function' },
  { name: 'cube', description: 'Cube of a value', meta: 'function' },
  { name: 'divide', description: 'Division', meta: 'function' },
  { name: 'exp', description: 'Exponential function', meta: 'function' },
  { name: 'floor', description: 'Floor function', meta: 'function' },
  { name: 'gcd', description: 'Greatest common divisor', meta: 'function' },
  { name: 'log', description: 'Logarithm', meta: 'function' },
  { name: 'log10', description: 'Base 10 logarithm', meta: 'function' },
  { name: 'mod', description: 'Modulus', meta: 'function' },
  { name: 'multiply', description: 'Multiplication', meta: 'function' },
  { name: 'pow', description: 'Power function', meta: 'function' },
  { name: 'round', description: 'Round to nearest integer', meta: 'function' },
  { name: 'sqrt', description: 'Square root', meta: 'function' },
  { name: 'square', description: 'Square of a value', meta: 'function' },
  { name: 'subtract', description: 'Subtraction', meta: 'function' },
  
  // Trigonometric functions
  { name: 'sin', description: 'Sine function', meta: 'trig' },
  { name: 'cos', description: 'Cosine function', meta: 'trig' },
  { name: 'tan', description: 'Tangent function', meta: 'trig' },
  { name: 'asin', description: 'Arcsine function', meta: 'trig' },
  { name: 'acos', description: 'Arccosine function', meta: 'trig' },
  { name: 'atan', description: 'Arctangent function', meta: 'trig' },
  { name: 'atan2', description: 'Four-quadrant arctangent', meta: 'trig' },
  { name: 'sinh', description: 'Hyperbolic sine', meta: 'trig' },
  { name: 'cosh', description: 'Hyperbolic cosine', meta: 'trig' },
  { name: 'tanh', description: 'Hyperbolic tangent', meta: 'trig' },
  
  // Statistics
  { name: 'mean', description: 'Mean/average', meta: 'stats' },
  { name: 'median', description: 'Median', meta: 'stats' },
  { name: 'mode', description: 'Mode', meta: 'stats' },
  { name: 'std', description: 'Standard deviation', meta: 'stats' },
  { name: 'variance', description: 'Variance', meta: 'stats' },
  
  // Matrix operations
  { name: 'det', description: 'Matrix determinant', meta: 'matrix' },
  { name: 'inv', description: 'Matrix inverse', meta: 'matrix' },
  { name: 'transpose', description: 'Matrix transpose', meta: 'matrix' },
  { name: 'cross', description: 'Vector cross product', meta: 'matrix' },
  { name: 'dot', description: 'Vector dot product', meta: 'matrix' },
  
  // Constants
  { name: 'pi', description: 'Pi constant (3.14159...)', meta: 'constant' },
  { name: 'e', description: 'Euler\'s number (2.71828...)', meta: 'constant' },
  { name: 'phi', description: 'Golden ratio (1.61803...)', meta: 'constant' },
  { name: 'i', description: 'Imaginary unit', meta: 'constant' },
  
  // Special functions
  { name: 'factorial', description: 'Factorial function', meta: 'function' },
  { name: 'gamma', description: 'Gamma function', meta: 'function' },
  { name: 'erf', description: 'Error function', meta: 'function' },
];

// Define the custom property on the Completer interface
interface MathFunctionsCompleter extends Completer {
  _sciEditorCustom: boolean;
  getCompletions: (
    editor: any,
    session: any,
    pos: { row: number; column: number },
    prefix: string,
    callback: (err: any, completions: Completion[]) => void
  ) => void;
}

// The math functions completer for Ace editor
export const mathFunctionsCompleter: MathFunctionsCompleter = {
  // Custom property to identify this completer
  _sciEditorCustom: true,
  
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
    
    // Filter functions that match the prefix
    const matchingFunctions = mathFunctions.filter(func => 
      func.name.toLowerCase().indexOf(prefix.toLowerCase()) !== -1
    );
    
    // Convert to Ace Completion format
    const completions = matchingFunctions.map(func => ({
      caption: func.name,
      value: func.name,
      meta: func.meta,
      score: 1000, // High score to prioritize these completions
      docText: func.description
    }));
    
    callback(null, completions);
  }
}; 