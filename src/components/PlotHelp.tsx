import React from 'react';
import './PlotHelp.css';

interface PlotHelpProps {
  onClose?: () => void;
  onInsertExample?: (example: string) => void;
}

const PlotHelp: React.FC<PlotHelpProps> = ({ onClose, onInsertExample }) => {
  // Examples of plot commands
  const examples = [
    { 
      name: 'Basic Sine Wave', 
      command: 'plot(sin(x), -10, 10)', 
      description: 'Plots a sine wave from -10 to 10'
    },
    { 
      name: 'Quadratic Function', 
      command: 'plot(x^2, -5, 5)', 
      description: 'Plots a parabola from -5 to 5'
    },
    { 
      name: 'Cosine with Title', 
      command: 'plot(cos(x), -Math.PI*2, Math.PI*2, 100, "Cosine Function")', 
      description: 'Plots a cosine wave with a custom title'
    },
    { 
      name: 'Using Variables', 
      command: 'plot(a*sin(b*x), -10, 10)', 
      description: 'Plots using variables (define a and b first)'
    },
    { 
      name: 'Complex Function', 
      command: 'plot(sin(x) * e^(-x/10), -10, 10, 200, "Damped Oscillation")', 
      description: 'Plots a damped oscillation with 200 points'
    }
  ];

  return (
    <div className="plot-help-content">
      <h2>Plot Function Help</h2>
      
      <div className="plot-help-section">
        <h3>Syntax</h3>
        <pre className="syntax-block">plot(expression, xMin, xMax, points, title)</pre>
        <ul className="help-list">
          <li><strong>expression</strong>: The function to plot (required)</li>
          <li><strong>xMin</strong>: Starting x value (default: -10)</li>
          <li><strong>xMax</strong>: Ending x value (default: 10)</li>
          <li><strong>points</strong>: Number of points to calculate (default: 100)</li>
          <li><strong>title</strong>: Chart title (default: "Function Plot")</li>
        </ul>
        <p><strong>Note:</strong> Use <code>x</code> as the variable in your expression. You can also use any variables you've defined in the notepad.</p>
      </div>
      
      <div className="plot-help-section">
        <h3>Examples</h3>
        <div className="examples-list">
          {examples.map((example, index) => (
            <div key={index} className="example-item">
              <div className="example-info">
                <h4>{example.name}</h4>
                <pre className="command-block">{example.command}</pre>
                <p>{example.description}</p>
              </div>
              {onInsertExample && (
                <button 
                  className="insert-example-btn"
                  onClick={() => onInsertExample(example.command)}
                  aria-label={`Insert ${example.name} example`}
                >
                  Insert
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="plot-help-section">
        <h3>Tips</h3>
        <ul className="help-list">
          <li>Use <kbd>{navigator.platform.toLowerCase().includes('mac') ? '⌘+P' : 'Ctrl+P'}</kbd> to quickly insert a plot template</li>
          <li>Define variables (e.g., <code>a = 2</code>) before using them in plots</li>
          <li>Use standard mathematical functions: sin, cos, tan, sqrt, log, etc.</li>
          <li>Close plots by clicking the × button in the top-right corner</li>
        </ul>
      </div>
      
      <div className="modal-footer">
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PlotHelp; 