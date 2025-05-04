import React, { useState } from 'react';
import './LatexExport.css';

interface LatexExportProps {
  documentContent: string;
  documentTitle: string;
  onClose: () => void;
}

const LatexExport: React.FC<LatexExportProps> = ({ documentContent, documentTitle, onClose }) => {
  const [includeTitle, setIncludeTitle] = useState<boolean>(true);
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [documentClass, setDocumentClass] = useState<string>('article');
  const [latexOutput, setLatexOutput] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const generateLatex = () => {
    // Start with document preamble
    let latex = `\\documentclass{${documentClass}}\n`;
    latex += '\\usepackage{amsmath}\n';
    latex += '\\usepackage{amssymb}\n';
    latex += '\\usepackage{mathtools}\n';
    
    // Add document title if requested
    if (includeTitle) {
      latex += `\\title{${escapeLatex(documentTitle)}}\n`;
      latex += '\\author{}\n';
    }
    
    // Add date if requested
    if (includeDate) {
      latex += `\\date{\\today}\n`;
    } else {
      latex += '\\date{}\n';
    }
    
    // Start document
    latex += '\\begin{document}\n';
    
    // Add title if requested
    if (includeTitle) {
      latex += '\\maketitle\n\n';
    }
    
    // Process document content
    const processedContent = processContentToLatex(documentContent);
    latex += processedContent;
    
    // End document
    latex += '\\end{document}';
    
    setLatexOutput(latex);
    setShowPreview(true);
  };

  const processContentToLatex = (content: string): string => {
    if (!content) return '';
    
    let lines = content.split('\n');
    let latexContent = '';
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.trim() === '') {
        latexContent += '\n';
        continue;
      }
      
      // Check if line is an equation
      if (line.includes('=')) {
        const parts = line.split('=');
        const leftSide = parts[0].trim();
        const rightSide = parts.slice(1).join('=').trim();
        
        // Format as a LaTeX equation
        latexContent += `\\begin{equation}\n${escapeLatex(leftSide)} = ${escapeLatex(rightSide)}\n\\end{equation}\n\n`;
      } else if (line.trim().startsWith('plot(')) {
        // Handle plot commands by adding a figure placeholder
        latexContent += '\\begin{figure}[h]\n';
        latexContent += '\\centering\n';
        latexContent += '% Plot: ' + escapeLatex(line) + '\n';
        latexContent += '\\caption{Plot}\n';
        latexContent += '\\end{figure}\n\n';
      } else {
        // Regular text paragraph
        latexContent += escapeLatex(line) + '\n\n';
      }
    }
    
    return latexContent;
  };

  // Escape special LaTeX characters
  const escapeLatex = (text: string): string => {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/&/g, '\\&')
      .replace(/_/g, '\\_')
      .replace(/\$/g, '\\$')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}');
  };

  const downloadLatex = () => {
    // Create a blob with the LaTeX content
    const blob = new Blob([latexOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexOutput).then(
      () => {
        // Show success message
        const copyMsg = document.getElementById('latex-copy-success');
        if (copyMsg) {
          copyMsg.style.display = 'inline-block';
          setTimeout(() => {
            copyMsg.style.display = 'none';
          }, 2000);
        }
      },
      (err) => {
        console.error('Could not copy LaTeX: ', err);
      }
    );
  };

  return (
    <div className="latex-export-modal">
      <div className="latex-export-content">
        <h2>Export to LaTeX</h2>
        
        <div className="latex-export-options">
          <div className="latex-option">
            <label>
              <input 
                type="checkbox" 
                checked={includeTitle} 
                onChange={(e) => setIncludeTitle(e.target.checked)} 
              />
              Include document title
            </label>
          </div>
          
          <div className="latex-option">
            <label>
              <input 
                type="checkbox" 
                checked={includeDate} 
                onChange={(e) => setIncludeDate(e.target.checked)} 
              />
              Include date
            </label>
          </div>
          
          <div className="latex-option">
            <label>Document Class:</label>
            <select 
              value={documentClass} 
              onChange={(e) => setDocumentClass(e.target.value)}
            >
              <option value="article">Article</option>
              <option value="report">Report</option>
              <option value="book">Book</option>
              <option value="beamer">Presentation (Beamer)</option>
            </select>
          </div>
          
          <button className="latex-generate-btn" onClick={generateLatex}>
            Generate LaTeX
          </button>
        </div>
        
        {showPreview && (
          <div className="latex-preview">
            <div className="latex-preview-header">
              <h3>LaTeX Output</h3>
              <div className="latex-preview-actions">
                <button onClick={copyToClipboard}>
                  Copy to Clipboard
                </button>
                <span id="latex-copy-success" style={{ display: 'none', marginLeft: '10px', color: 'green' }}>
                  Copied!
                </span>
                <button onClick={downloadLatex}>
                  Download .tex File
                </button>
              </div>
            </div>
            
            <pre className="latex-code">{latexOutput}</pre>
          </div>
        )}
        
        <div className="latex-export-footer">
          <button className="latex-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatexExport; 