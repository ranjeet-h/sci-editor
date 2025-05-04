import React from 'react';
import { Variable } from '../types';

interface EnovateVariableDefinitionProps {
  variableInput: string;
  setVariableInput: (value: string) => void;
  defineVariable: () => void;
  variables: Variable[];
  formatVariableValue: (variable: Variable) => string;
  insertSymbol: (symbol: string) => void;
  deleteVariable: (name: string) => void;
}

const EnovateVariableDefinition: React.FC<EnovateVariableDefinitionProps> = ({
  variableInput,
  setVariableInput,
  defineVariable,
  variables,
  formatVariableValue,
  insertSymbol,
  deleteVariable,
}) => {
  return (
    <div className="enovate-variable-section">
      <h3 className="enovate-title">Define Variable</h3>
      
      {/* New approach using nested divs to fix border corners */}
      <div style={{
        border: '1px solid rgba(66, 153, 225, 0.2)',
        borderRadius: '4px',
        backgroundColor: 'white',
        padding: '2px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03) inset',
        marginBottom: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            padding: '0 0 0 8px',
            color: 'var(--accent-highlight)',
            fontWeight: 600,
            fontFamily: 'var(--editor-font)',
            fontSize: '14px'
          }}>let</div>
          <input
            type="text"
            placeholder="e.g., x = 5"
            value={variableInput}
            onChange={(e) => setVariableInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && defineVariable()}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              fontSize: '14px',
              fontFamily: 'var(--editor-font)',
              backgroundColor: 'transparent',
              minWidth: 0,
              outline: 'none'
            }}
          />
          <button 
            onClick={defineVariable}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--accent-highlight)',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '8px 10px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minWidth: '70px',
              boxShadow: '0 2px 4px rgba(66, 153, 225, 0.2)',
              marginRight: '2px'
            }}
            title="Define this variable"
          >
            <span style={{ marginRight: '6px', fontSize: '16px' }}>≝</span>
            Define
          </button>
        </div>
      </div>
      
      <div className="enovate-help">
        <span>Format: <code>name = value</code> (e.g. <code>x = 5</code>, <code>radius = 10.5</code>)</span>
      </div>
      
      {/* Enovate Variables List */}
      {variables.length > 0 && (
        <div className="enovate-variables-list">
          {variables.map((variable) => (
            <div key={variable.name} className="enovate-variable-item">
              <span className="enovate-var-name">{variable.name}</span>
              <span className="enovate-var-equals">=</span>
              <span className="enovate-var-value">
                {formatVariableValue(variable)}
              </span>
              <button
                onClick={() => insertSymbol(variable.name)}
                className="enovate-var-use-btn"
                title="Use this variable"
              >
                Use
              </button>
              <button
                onClick={() => deleteVariable(variable.name)}
                className="enovate-var-delete"
                title="Delete this variable"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {variables.length === 0 && (
        <div className="enovate-empty-state">
          No variables defined yet.
        </div>
      )}
    </div>
  );
};

export default EnovateVariableDefinition; 