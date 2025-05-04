import React, { useState, useRef, useEffect, KeyboardEvent, useCallback, MouseEvent } from 'react';
import { evaluate, parser, typeOf } from 'mathjs';
import PlotCommand from './components/PlotCommand';
import PlotHelp from './components/PlotHelp';
import DocumentManager from './components/DocumentManager';
import DocumentExport from './components/DocumentExport';
import TagsManager from './components/TagsManager';
import CategoriesManager from './components/CategoriesManager';
import SciEditor from './components/SciEditor';
import EnovateVariableDefinition from './components/EnovateVariableDefinition';
import { Document, Tag, Category, Suggestion, HistoryItem, Variable, PlotItem } from './types';
import { createNewDocument } from './types/Document';
import './App.css';

function App() {
  const [text, setText] = useState<string>('');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [equationHistory, setEquationHistory] = useState<HistoryItem[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showVariables, setShowVariables] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showPlotHelp, setShowPlotHelp] = useState<boolean>(false);
  const [showDocumentManager, setShowDocumentManager] = useState<boolean>(false);
  const [showDocumentExport, setShowDocumentExport] = useState<boolean>(false);
  const [showTagsManager, setShowTagsManager] = useState<boolean>(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState<boolean>(false);
  const [variableInput, setVariableInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMac, setIsMac] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [useEnovateUI, setUseEnovateUI] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mathParserRef = useRef(parser());
  const [newPlotAdded, setNewPlotAdded] = useState<boolean>(false);
  const [numberFormat, setNumberFormat] = useState<'international' | 'indian'>('international');

  // Detect operating system and locale on component mount
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
    
    // Detect user's locale for number formatting
    const userLocale = navigator.language || 'en-US';
    // Set to Indian format if user is from India, Bangladesh, Nepal, Pakistan, Sri Lanka
    if (['hi', 'bn', 'ne', 'pa', 'si', 'ta', 'te', 'ml', 'kn', 'ur'].some(code => 
        userLocale.toLowerCase().startsWith(code) || userLocale.includes('-IN')
    )) {
      setNumberFormat('indian');
    } else {
      setNumberFormat('international');
    }
  }, []);

  // Load documents and document data from localStorage on initial render
  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem('sciNotepadDocuments');
      
      if (savedDocuments) {
        try {
          const parsedDocuments = JSON.parse(savedDocuments);
          
          // Validate the documents structure
          if (Array.isArray(parsedDocuments) && parsedDocuments.length > 0) {
            setDocuments(parsedDocuments);

            // Load active document if it exists
            const savedActiveDocId = localStorage.getItem('sciNotepadActiveDocument');
            
            if (savedActiveDocId) {
              // Find the active document to make sure it still exists
              const activeDoc = parsedDocuments.find((doc: Document) => doc.id === savedActiveDocId);
              
              if (activeDoc) {
                setActiveDocumentId(savedActiveDocId);
                setText(activeDoc.content);
                setEquationHistory(activeDoc.history || []);
                setVariables(activeDoc.variables || []);
              } else {
                // If active document not found, load the first one
                setActiveDocumentId(parsedDocuments[0].id);
                setText(parsedDocuments[0].content);
                setEquationHistory(parsedDocuments[0].history || []);
                setVariables(parsedDocuments[0].variables || []);
              }
            } else if (parsedDocuments.length > 0) {
              // If no active document is saved but documents exist, load the first one
              setActiveDocumentId(parsedDocuments[0].id);
              setText(parsedDocuments[0].content);
              setEquationHistory(parsedDocuments[0].history || []);
              setVariables(parsedDocuments[0].variables || []);
            }
            return; // Exit early as we successfully loaded documents
          }
        } catch (parseError) {
          console.error('Error parsing saved documents:', parseError);
          setErrorMessage('Error loading your previous documents. Creating a new one.');
          setTimeout(() => setErrorMessage(null), 3000);
          // Continue to create default document
        }
      }
      
      // Create default document if no valid documents were loaded
      console.log('Creating default document');
      const defaultDoc = createNewDocument('Getting Started');
      setDocuments([defaultDoc]);
      setActiveDocumentId(defaultDoc.id);
      setText(defaultDoc.content);
      
      // Save default document to localStorage
      localStorage.setItem('sciNotepadDocuments', JSON.stringify([defaultDoc]));
      localStorage.setItem('sciNotepadActiveDocument', defaultDoc.id);
      
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setErrorMessage('Could not access browser storage. Your documents may not be saved.');
      setTimeout(() => setErrorMessage(null), 5000);
      
      // Create an in-memory document that won't persist
      const defaultDoc = createNewDocument('Getting Started');
      setDocuments([defaultDoc]);
      setActiveDocumentId(defaultDoc.id);
      setText(defaultDoc.content);
    }
  }, []);

  // Function to handle saving documents to localStorage
  const saveDocumentsToStorage = useCallback((docsToSave: Document[]) => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('sciNotepadDocuments', JSON.stringify(docsToSave));
      // Show saved status briefly
      setTimeout(() => setSaveStatus('saved'), 600);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save your document. Check browser storage.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      saveDocumentsToStorage(documents);
    }
  }, [documents, saveDocumentsToStorage]);

  // Save active document ID to localStorage whenever it changes
  useEffect(() => {
    if (activeDocumentId) {
      localStorage.setItem('sciNotepadActiveDocument', activeDocumentId);
    }
  }, [activeDocumentId]);

  // Update active document content, history, and variables when they change
  useEffect(() => {
    if (activeDocumentId && documents.length > 0) {
      // Update the active document with current state
      const updatedDocuments = documents.map(doc => {
        if (doc.id === activeDocumentId) {
          return {
            ...doc,
            content: text,
            history: equationHistory,
            variables: variables,
            updatedAt: Date.now()
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
    }
  }, [text, equationHistory, variables]);

  // Document operations
  const handleDocumentSelect = (documentId: string) => {
    try {
      console.log(`Attempting to select document: ${documentId}, current active doc: ${activeDocumentId}`);
      
      // Don't do anything if selecting the already active document
      if (documentId === activeDocumentId) {
        console.log("Already on this document, just closing manager");
        setShowDocumentManager(false);
        return;
      }
      
      // Always save current document state before switching
      if (activeDocumentId) {
        console.log("Saving current document before switching");
        const updatedDocuments = documents.map(doc => {
          if (doc.id === activeDocumentId) {
            return {
              ...doc,
              content: text,
              history: equationHistory,
              variables: variables,
              updatedAt: Date.now()
            };
          }
          return doc;
        });
        
        setDocuments(updatedDocuments);
        // Immediately save to localStorage
        localStorage.setItem('sciNotepadDocuments', JSON.stringify(updatedDocuments));
      }
      
      // Load selected document
      const selectedDoc = documents.find(doc => doc.id === documentId);
      if (selectedDoc) {
        console.log(`Switching to document: ${selectedDoc.title} (ID: ${selectedDoc.id})`);
        
        // First reset all state to avoid mixing data
        setSuggestion(null);
        setPlots([]);
        
        // Reset math parser
        const mathParser = mathParserRef.current;
        mathParser.clear();
        
        // Now set the new document data
        setText(selectedDoc.content || '');
        setEquationHistory(Array.isArray(selectedDoc.history) ? selectedDoc.history : []);
        setVariables(Array.isArray(selectedDoc.variables) ? selectedDoc.variables : []);
        
        // Set active document ID
        setActiveDocumentId(documentId);
        
        // Immediately save the active document ID
        localStorage.setItem('sciNotepadActiveDocument', documentId);
        
        // Load variables into math parser
        if (Array.isArray(selectedDoc.variables)) {
          selectedDoc.variables.forEach(variable => {
            try {
              mathParser.set(variable.name, variable.value);
            } catch (err) {
              console.error(`Error setting variable ${variable.name}:`, err);
            }
          });
        }
        
        setErrorMessage(`Switched to "${selectedDoc.title}"`);
        setTimeout(() => setErrorMessage(null), 2000);
      } else {
        console.error('Selected document not found:', documentId);
        setErrorMessage('Error: Document not found');
        setTimeout(() => setErrorMessage(null), 3000);
      }
      
      // Close document manager
      setShowDocumentManager(false);
    } catch (error) {
      console.error('Error switching documents:', error);
      setErrorMessage('Failed to switch documents. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleDocumentCreate = () => {
    try {
      // Create a new document with a random title
      const newDoc = createNewDocument(`New Document ${Math.floor(Math.random() * 1000)}`);
      
      // First save the current document state
      if (activeDocumentId) {
        const currentDocIndex = documents.findIndex(doc => doc.id === activeDocumentId);
        if (currentDocIndex !== -1) {
          const updatedDocs = [...documents];
          updatedDocs[currentDocIndex] = {
            ...updatedDocs[currentDocIndex],
            content: text,
            history: equationHistory,
            variables: variables,
            updatedAt: Date.now()
          };
          
          // Add the new document to the updated array
          const finalDocs = [...updatedDocs, newDoc];
          setDocuments(finalDocs);
          
          // Immediately save to localStorage
          localStorage.setItem('sciNotepadDocuments', JSON.stringify(finalDocs));
          
          // Switch to the new document
          console.log('Created new document with ID:', newDoc.id);
          
          // Clear text and reset state for the new document
          setText('');
          setEquationHistory([]);
          setVariables([]);
          setPlots([]);
          setSuggestion(null);
          
          // Set the active document ID after state is cleared
          setActiveDocumentId(newDoc.id);
          localStorage.setItem('sciNotepadActiveDocument', newDoc.id);
          setShowDocumentManager(false); // Close the manager after creating
          
          setSaveStatus('saved');
          setErrorMessage('New document created successfully');
          setTimeout(() => setErrorMessage(null), 3000);
          return;
        }
      }
      
      // If no active document or something went wrong, just add new doc
      const updatedDocuments = [...documents, newDoc];
      setDocuments(updatedDocuments);
      
      // Immediately save to localStorage
      localStorage.setItem('sciNotepadDocuments', JSON.stringify(updatedDocuments));
      
      // Clear editor state for new document
      setText('');
      setEquationHistory([]);
      setVariables([]);
      setPlots([]);
      setSuggestion(null);
      
      // Set active document ID
      setActiveDocumentId(newDoc.id);
      localStorage.setItem('sciNotepadActiveDocument', newDoc.id);
      setShowDocumentManager(false);
      
      setSaveStatus('saved');
      setErrorMessage('New document created successfully');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Error creating document:', error);
      setErrorMessage('Failed to create document. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleDocumentDelete = (documentId: string) => {
    try {
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      // Immediately save to localStorage
      localStorage.setItem('sciNotepadDocuments', JSON.stringify(updatedDocuments));
      
      // If the active document was deleted, select another one
      if (activeDocumentId === documentId && updatedDocuments.length > 0) {
        handleDocumentSelect(updatedDocuments[0].id);
      } else if (updatedDocuments.length === 0) {
        // If no documents left, create a new one
        const newDoc = createNewDocument();
        const newDocuments = [newDoc];
        setDocuments(newDocuments);
        localStorage.setItem('sciNotepadDocuments', JSON.stringify(newDocuments));
        handleDocumentSelect(newDoc.id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setErrorMessage('Failed to delete document. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleDocumentRename = (documentId: string, newTitle: string) => {
    try {
      if (!newTitle.trim()) {
        setErrorMessage('Document name cannot be empty.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      
      const updatedDocuments = documents.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            title: newTitle,
            updatedAt: Date.now()
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
      // Immediately save to localStorage
      localStorage.setItem('sciNotepadDocuments', JSON.stringify(updatedDocuments));
    } catch (error) {
      console.error('Error renaming document:', error);
      setErrorMessage('Failed to rename document. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const toggleDocumentManager = () => {
    setShowDocumentManager(!showDocumentManager);
  };


  useEffect(() => {
    // Load saved variables into mathjs scope
    const mathParser = mathParserRef.current;
    variables.forEach(variable => {
      mathParser.set(variable.name, variable.value);
    });
  }, [variables]);

  // Add a new function to check for variable suggestions
  const checkForVariableSuggestions = () => {
    if (!textareaRef.current) return;
    
    const cursorPosition = textareaRef.current.selectionStart;
    const currentText = textareaRef.current.value;
    const lines = currentText.split('\n');
    
    // Find which line the cursor is on
    let currentLineIndex = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline character
      if (charCount + lineLength > cursorPosition) {
        currentLineIndex = i;
        break;
      }
      charCount += lineLength;
    }
    
    const currentLine = lines[currentLineIndex];
    const cursorPosInLine = cursorPosition - charCount;
    
    // Get the partial word the cursor is on
    const textBeforeCursor = currentLine.substring(0, cursorPosInLine);
    const partialMatch = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    
    console.log("Variable check:", { 
      cursorPos: cursorPosition,
      currentLine, 
      cursorPosInLine,
      textBeforeCursor,
      partialMatch: partialMatch ? partialMatch[0] : null,
      variables: variables.map(v => v.name),
    });
    
    if (partialMatch && partialMatch[0].length >= 1 && !textBeforeCursor.trim().endsWith('=')) {
      const partialVar = partialMatch[0];
      
      // Find matching variables - more permissive matching
      const matchingVariables = variables.filter(v => 
        v.name.toLowerCase().includes(partialVar.toLowerCase()) && 
        v.name.toLowerCase() !== partialVar.toLowerCase() // Don't suggest if exact match
      );
      
      console.log(`Found ${matchingVariables.length} matches for "${partialVar}"`, 
        matchingVariables.map(v => `${v.name} = ${v.value}`));
      
      if (matchingVariables.length > 0) {
        // Sort by startsWith first, then by alphabetical
        matchingVariables.sort((a, b) => {
          // Prioritize variables that start with the partial text
          const aStarts = a.name.toLowerCase().startsWith(partialVar.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(partialVar.toLowerCase());
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // If equal, sort alphabetically
          return a.name.localeCompare(b.name);
        });
        
        const matchedVar = matchingVariables[0]; // Take first match after sorting
        const partialStart = textBeforeCursor.length - partialVar.length;
        
        // Format variable value for display
        const varValue = formatVariableValue(matchedVar);
        
        console.log("Setting variable suggestion:", {
          value: matchedVar.name,
          variableValue: varValue,
          lineIndex: currentLineIndex,
          position: {
            start: partialStart,
            end: partialStart + partialVar.length
          }
        });
        
        setSuggestion({
          value: matchedVar.name,
          variableValue: varValue,
          lineIndex: currentLineIndex,
          position: {
            start: partialStart,
            end: partialStart + partialVar.length
          },
          isVariable: true
        });
        return true; // Suggestion was set
      }
    }
    
    return false; // No suggestion was set
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Immediately update and save document with the new text
    if (activeDocumentId) {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === activeDocumentId) {
          return {
            ...doc,
            content: newText,
            updatedAt: Date.now()
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
    }
    
    // First check for variable suggestions
    const variableSuggestionSet = checkForVariableSuggestions();
    
    // Only check for equations if no variable suggestion was set
    if (!variableSuggestionSet) {
      checkForEquation(newText);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Clear error message on any key press
    if (errorMessage) {
      setErrorMessage(null);
    }
    
    // Keyboard shortcuts for common functions (using Ctrl/Cmd key for cross-platform compatibility)
    if ((isMac && e.metaKey) || (!isMac && e.ctrlKey)) {
      // Mathematical functions shortcuts
      switch (e.key) {
        case 'o': // Document manager
          e.preventDefault();
          toggleDocumentManager();
          break;
        case 'i': // Pi (avoid P which is used for print)
          e.preventDefault();
          insertSymbol('pi');
          return;
        case 'q': // Euler's number (avoid E which might be used in some browsers)
          e.preventDefault();
          insertSymbol('e');
          return;
        case 'n': // Sine (avoid S for save)
          e.preventDefault();
          insertSymbol('sin(');
          return;
        case 'j': // Tangent (avoid A which is used for select all)
          e.preventDefault();
          insertSymbol('tan(');
          return;
        case 'c': // Cosine (changed from 'o' which is now used for document manager)
          if (e.altKey) {
            e.preventDefault();
            insertSymbol('cos(');
            return;
          }
          break;
        case 'g': // Logarithm (avoid L which might be used for location)
          e.preventDefault();
          insertSymbol('log(');
          return;
        case 'r': // Square root
          e.preventDefault();
          insertSymbol('sqrt(');
          return;
        case '6': // Power (^)
          e.preventDefault();
          insertSymbol('^');
          return;
        case 'm': // Matrix
          e.preventDefault();
          insertSymbol('[[,], [,]]');
          return;
        case 'b': // Variables panel (avoid V for paste)
          e.preventDefault();
          setShowVariables(!showVariables);
          return;
        case 'u': // Show/hide history panel (avoid H for browser history)
          e.preventDefault();
          setShowHistory(!showHistory);
          return;
        case 'k': // Show/hide shortcuts panel
          e.preventDefault();
          setShowShortcuts(!showShortcuts);
          return;
        case 'p': // Insert plot template (using p for plot - different from browser print since we're using Ctrl/Cmd)
          e.preventDefault();
          insertSymbol('plot(sin(x), -10, 10)');
          return;
      }
    }
    
    // Check specifically for "=" key press to immediately trigger evaluation
    if (e.key === '=') {
      // We'll let the onChange handler update the text first, then check for equations
      setTimeout(() => {
        if (textareaRef.current) {
          checkForEquation(textareaRef.current.value);
        }
      }, 0);
    }
    
    if (suggestion) {
      if (e.key === 'Tab') {
        e.preventDefault();
        
        if (suggestion.isVariable) {
          // Complete the variable name
          const lines = text.split('\n');
          const line = lines[suggestion.lineIndex];
          const prefix = line.substring(0, suggestion.position.start);
          const suffix = line.substring(suggestion.position.end);
          
          // Replace the partial match with the full variable name
          lines[suggestion.lineIndex] = prefix + suggestion.value + suffix;
          const updatedText = lines.join('\n');
          setText(updatedText);
          
          // Set cursor position after the variable name
          setTimeout(() => {
            if (textareaRef.current) {
              let cursorPos = 0;
              
              // Calculate position for cursor
              for (let i = 0; i < suggestion.lineIndex; i++) {
                cursorPos += lines[i].length + 1; // +1 for newline
              }
              cursorPos += prefix.length + suggestion.value.length;
              
              textareaRef.current.selectionStart = cursorPos;
              textareaRef.current.selectionEnd = cursorPos;
              textareaRef.current.focus();
            }
          }, 0);
        } else {
          // Handle regular equation suggestions (existing logic)
          const lines = text.split('\n');
          const expression = lines[suggestion.lineIndex].match(/(.+?)\s*=\s*$/)?.[1].trim() || '';
          lines[suggestion.lineIndex] = lines[suggestion.lineIndex].replace(/=\s*$/, "= " + suggestion.value);
          const updatedText = lines.join('\n');
          setText(updatedText);
          
          // Add to equation history
          if (expression && suggestion.value) {
            const newHistoryItem: HistoryItem = {
              expression,
              result: suggestion.value,
              timestamp: Date.now()
            };
            setEquationHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // Keep last 50 items
          }
          
          // Move cursor to the end of the inserted result
          setTimeout(() => {
            if (textareaRef.current) {
              const cursorPosition = updatedText.length;
              textareaRef.current.selectionStart = cursorPosition;
              textareaRef.current.selectionEnd = cursorPosition;
              textareaRef.current.focus();
            }
          }, 0);
        }
        
        setSuggestion(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestion(null);
      }
    }
  };

  const insertSymbol = (symbol: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const newText = 
        text.substring(0, selectionStart) +
        symbol + 
        text.substring(selectionEnd);
      
      setText(newText);
      
      // Position cursor appropriately (inside parentheses if applicable)
      setTimeout(() => {
        const newPosition = symbol.includes('(') 
          ? selectionStart + symbol.indexOf('(') + 1 
          : selectionStart + symbol.length;
        
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
  };

  const insertFromHistory = (historyItem: HistoryItem) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const expressionToInsert = historyItem.expression;
      
      const newText = 
        text.substring(0, selectionStart) +
        expressionToInsert + 
        text.substring(selectionEnd);
      
      setText(newText);
      
      // Position cursor at the end of inserted text
      setTimeout(() => {
        const newPosition = selectionStart + expressionToInsert.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
  };

  const defineVariable = () => {
    try {
      // Format: name = value
      const match = variableInput.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      
      if (!match) {
        throw new Error("Invalid format. Use 'name = value'");
      }
      
      const name = match[1];
      const valueExpression = match[2];
      
      // Reserved words in mathjs
      const reservedWords = ['e', 'pi', 'i', 'sin', 'cos', 'tan', 'log', 'sqrt'];
      if (reservedWords.includes(name)) {
        throw new Error(`'${name}' is a reserved word`);
      }
      
      // Evaluate the value
      const mathParser = mathParserRef.current;
      const value = mathParser.evaluate(valueExpression);
      const type = typeOf(value);
      
      // Add to variables
      setVariables(prev => {
        // If variable already exists, update it
        const exists = prev.findIndex(v => v.name === name);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = { name, value, type };
          return updated;
        }
        // Otherwise add new variable
        return [...prev, { name, value, type }];
      });
      
      // Set the variable in mathjs scope
      mathParser.set(name, value);
      
      // Clear input
      setVariableInput('');
    } catch (error) {
      console.error("Variable definition error:", error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const deleteVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name));
    // Remove from mathjs scope
    mathParserRef.current.remove(name);
  };

  // Function to format numbers with commas using different formats
  const formatWithCommas = (num: number): string => {
    // Get the absolute value and handle negative sign separately
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // Handle direct powers of 10 which might not get formatted correctly
    // This ensures 10^10 = 10,000,000,000 works properly
    if (Math.log10(absNum) % 1 === 0 && absNum > 1000) {
      return formatLargeNumber(num);
    }
    
    if (numberFormat === 'indian') {
      // Indian format: 1,00,00,000 (lakh, crore system)
      const numStr = absNum.toString();
      
      // Handle decimal part (if any)
      const parts = numStr.split('.');
      let integerPart = parts[0];
      const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
      
      // Proper Indian formatting: first 3 digits, then groups of 2
      // For example: 1,00,00,000 for 10 million
      const length = integerPart.length;
      
      if (length <= 3) {
        // No commas needed for numbers up to 999
        return (isNegative ? '-' : '') + integerPart + decimalPart;
      } else {
        // Place commas for Indian number system
        let result = '';
        
        // Add digits from right to left
        for (let i = 0; i < length; i++) {
          if (i === 0) {
            // Start building from the rightmost digit
            result = integerPart[length - 1 - i] + result;
          } else if (i === 3) {
            // Add comma after first 3 digits (from right)
            result = integerPart[length - 1 - i] + ',' + result;
          } else if (i > 3 && (i - 1) % 2 === 0) {
            // Add comma after every 2 digits thereafter
            result = integerPart[length - 1 - i] + ',' + result;
          } else {
            // Just add the digit
            result = integerPart[length - 1 - i] + result;
          }
        }
        
        return (isNegative ? '-' : '') + result + decimalPart;
      }
    } else {
      // International format: 1,000,000,000
      // Use a more direct approach for integer numbers
      if (Number.isInteger(absNum)) {
        const numStr = absNum.toString();
        // Add commas every 3 digits from the right
        let result = '';
        for (let i = 0; i < numStr.length; i++) {
          if (i > 0 && (numStr.length - i) % 3 === 0) {
            result += ',';
          }
          result += numStr[i];
        }
        return (isNegative ? '-' : '') + result;
      }
      return (isNegative ? '-' : '') + absNum.toLocaleString('en-US');
    }
  };

  const formatVariableValue = (variable: Variable): string => {
    if (variable.type === 'number') {
      const value = variable.value;

      // Handle formatting based on number size
      if (Math.abs(value) < 1e-10 && value !== 0) {
        // Very small numbers - keep scientific notation as they're hard to read otherwise
        return value.toExponential(4);
      } else if (Math.abs(value) >= 1e21) {
        // For extremely large numbers that might cause JavaScript issues, use a custom formatter
        // that preserves full precision but breaks into readable groups
        return formatLargeNumber(value);
      } else if (Number.isInteger(value)) {
        // For integers, format with commas
        return formatWithCommas(value);
      } else {
        // For decimal numbers, format with a reasonable number of decimal places and commas
        const fixedValue = parseFloat(value.toFixed(4));
        return formatWithCommas(fixedValue);
      }
    } else if (variable.type === 'Matrix') {
      return 'Matrix';
    }
    return variable.value.toString();
  };

  // Function to format very large numbers with commas without scientific notation
  const formatLargeNumber = (num: number): string => {
    // Get the absolute value and handle negative sign separately
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // Convert to string to handle full precision
    let numStr = absNum.toString();
    
    // If it contains scientific notation, convert to full number
    if (numStr.includes('e')) {
      const parts = numStr.split('e');
      const base = parts[0];
      const exp = parseInt(parts[1]);
      
      if (exp > 0) {
        // For positive exponents (large numbers)
        const decimalPos = base.indexOf('.');
        if (decimalPos !== -1) {
          // Remove decimal point and pad with zeros
          numStr = base.replace('.', '') + '0'.repeat(exp - (base.length - decimalPos - 1));
        } else {
          // Just add zeros
          numStr = base + '0'.repeat(exp);
        }
      } else {
        // For negative exponents (small numbers)
        // We shouldn't reach here due to earlier check, but handling just in case
        numStr = '0.' + '0'.repeat(Math.abs(exp) - 1) + base.replace('.', '');
      }
    }
    
    // Add commas based on the selected format
    const integerPart = numStr.split('.')[0];
    const decimalPart = numStr.includes('.') ? '.' + numStr.split('.')[1] : '';
    
    // Format with commas according to the selected style
    let formattedInteger;
    
    if (numberFormat === 'indian') {
      // Indian format: groups of 2 after first 3
      if (integerPart.length <= 3) {
        formattedInteger = integerPart;
      } else {
        // Place commas for Indian number system
        let result = '';
        
        // Add digits from right to left
        for (let i = 0; i < integerPart.length; i++) {
          const digitPos = integerPart.length - 1 - i; // Position from right
          
          if (i === 0) {
            // Start building from the rightmost digit
            result = integerPart[digitPos] + result;
          } else if (i === 3) {
            // Add comma after first 3 digits (from right)
            result = integerPart[digitPos] + ',' + result;
          } else if (i > 3 && (i - 3) % 2 === 0) {
            // Add comma after every 2 digits thereafter
            result = integerPart[digitPos] + ',' + result;
          } else {
            // Just add the digit
            result = integerPart[digitPos] + result;
          }
        }
        
        formattedInteger = result;
      }
    } else {
      // International format: groups of 3
      formattedInteger = '';
      for (let i = 0; i < integerPart.length; i++) {
        if (i > 0 && (integerPart.length - i) % 3 === 0) {
          formattedInteger += ',';
        }
        formattedInteger += integerPart[i];
      }
    }
    
    // Return with negative sign if needed
    return (isNegative ? '-' : '') + formattedInteger + decimalPart;
  };

  useEffect(() => {
    if (!suggestion) return;
    const lines = text.split('\n');
    if (
      suggestion.lineIndex >= lines.length ||
      !lines[suggestion.lineIndex].includes('=')
    ) {
      setSuggestion(null);
    }
  }, [text, suggestion]);

  // Scientific symbols grouped by category
  const symbolGroups = [
    {
      name: "Basic",
      symbols: [
        { label: '+', value: '+' },
        { label: '-', value: '-' },
        { label: '×', value: '*' },
        { label: '÷', value: '/' },
        { label: '=', value: '=' },
        { label: '()', value: '()' },
      ]
    },
    {
      name: "Trigonometry",
      symbols: [
        { label: 'sin', value: 'sin(' },
        { label: 'cos', value: 'cos(' },
        { label: 'tan', value: 'tan(' },
        { label: 'asin', value: 'asin(' },
        { label: 'acos', value: 'acos(' },
        { label: 'atan', value: 'atan(' },
      ]
    },
    {
      name: "Functions",
      symbols: [
        { label: 'log', value: 'log(' },
        { label: 'ln', value: 'log(' },
        { label: '√', value: 'sqrt(' },
        { label: 'x²', value: '^2' },
        { label: 'x³', value: '^3' },
        { label: 'xⁿ', value: '^' },
      ]
    },
    {
      name: "Constants",
      symbols: [
        { label: 'π', value: 'pi' },
        { label: 'e', value: 'e' },
        { label: 'i', value: 'i' },
        { label: 'φ', value: '(1+sqrt(5))/2' },
        { label: '∞', value: 'Infinity' },
      ]
    },
    {
      name: "Calculus",
      symbols: [
        { label: '∑', value: 'sum(' },
        { label: '∫', value: 'integrate(' },
        { label: '∂', value: 'derivative(' },
        { label: '!', value: '!' },
      ]
    },
    {
      name: "Matrices",
      symbols: [
        { label: 'matrix', value: '[[1, 2], [3, 4]]' },
        { label: 'det', value: 'det(' },
        { label: 'inv', value: 'inv(' },
        { label: 'transpose', value: 'transpose(' },
      ]
    },
  ];

  // Keyboard shortcuts reference - dynamically show Mac or Windows/Linux shortcuts
  const keyboardShortcuts = [
    { key: isMac ? '⌘+O' : 'Ctrl+O', description: 'Open document manager' },
    { key: isMac ? '⌘+I' : 'Ctrl+I', description: 'Insert π (Pi)' },
    { key: isMac ? '⌘+Q' : 'Ctrl+Q', description: 'Insert e (Euler\'s number)' },
    { key: isMac ? '⌘+N' : 'Ctrl+N', description: 'Insert sin() function' },
    { key: isMac ? '⌘+Alt+C' : 'Ctrl+Alt+C', description: 'Insert cos() function' },
    { key: isMac ? '⌘+J' : 'Ctrl+J', description: 'Insert tan() function' },
    { key: isMac ? '⌘+G' : 'Ctrl+G', description: 'Insert log() function' },
    { key: isMac ? '⌘+R' : 'Ctrl+R', description: 'Insert sqrt() function' },
    { key: isMac ? '⌘+6' : 'Ctrl+6', description: 'Insert power operator (^)' },
    { key: isMac ? '⌘+M' : 'Ctrl+M', description: 'Insert matrix template' },
    { key: isMac ? '⌘+P' : 'Ctrl+P', description: 'Insert plot template' },
    { key: isMac ? '⌘+B' : 'Ctrl+B', description: 'Toggle variables panel' },
    { key: isMac ? '⌘+U' : 'Ctrl+U', description: 'Toggle history panel' },
    { key: isMac ? '⌘+K' : 'Ctrl+K', description: 'Toggle shortcuts panel' },
    { key: 'Tab', description: 'Accept suggestion' },
    { key: 'Esc', description: 'Dismiss suggestion' },
  ];

  const closePlot = (id: string) => {
    setPlots(prev => prev.filter(plot => plot.id !== id));
  };

  const insertExample = (example: string) => {
    insertSymbol(example);
  };

  // When plots are added, set the notification state
  useEffect(() => {
    if (plots.length > 0) {
      setNewPlotAdded(true);
      // Clear the notification after 5 seconds
      const timer = setTimeout(() => {
        setNewPlotAdded(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [plots.length]);

  // Scroll to plots when created
  const plotsContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToPlots = useCallback(() => {
    if (plotsContainerRef.current) {
      plotsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (newPlotAdded) {
      scrollToPlots();
    }
  }, [newPlotAdded, scrollToPlots]);

  // Toggle document export
  const toggleDocumentExport = () => {
    setShowDocumentExport(!showDocumentExport);
  };

  // Toggle tags manager
  const toggleTagsManager = () => {
    setShowTagsManager(!showTagsManager);
  };

  // Toggle categories manager
  const toggleCategoriesManager = () => {
    setShowCategoriesManager(!showCategoriesManager);
  };

  // Get active document
  const getActiveDocument = (): Document | null => {
    if (!activeDocumentId) return null;
    return documents.find(doc => doc.id === activeDocumentId) || null;
  };

  // Handle import complete
  const handleImportComplete = (importedDocs: Document[]) => {
    // Merge imported documents with existing ones
    const mergedDocs = [...documents];
    
    importedDocs.forEach(importedDoc => {
      const existingDocIndex = mergedDocs.findIndex(doc => doc.id === importedDoc.id);
      if (existingDocIndex >= 0) {
        // Update existing document
        mergedDocs[existingDocIndex] = importedDoc;
      } else {
        // Add new document
        mergedDocs.push(importedDoc);
      }
    });
    
    setDocuments(mergedDocs);
    setShowDocumentExport(false);
  };

  // Handle tag creation
  const handleCreateTag = (tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tag,
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    };
    
    setTags([...tags, newTag]);
  };

  // Handle tag update for active document
  const handleUpdateDocumentTags = (tagIds: string[]) => {
    if (!activeDocumentId) return;
    
    const updatedDocs = documents.map(doc => {
      if (doc.id === activeDocumentId) {
        return {
          ...doc,
          tags: tagIds,
          updatedAt: Date.now()
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocs);
  };
  
  // Handle category creation
  const handleCreateCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    };
    
    setCategories([...categories, newCategory]);
  };
  
  // Handle category deletion
  const handleDeleteCategory = (categoryId: string) => {
    // Remove the category
    setCategories(categories.filter(cat => cat.id !== categoryId));
    
    // Update any documents that had this category
    const updatedDocs = documents.map(doc => {
      if (doc.categoryId === categoryId) {
        return {
          ...doc,
          categoryId: undefined,
          updatedAt: Date.now()
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocs);
  };
  
  // Handle category selection for active document
  const handleSelectCategory = (categoryId: string | undefined) => {
    if (!activeDocumentId) return;
    
    const updatedDocs = documents.map(doc => {
      if (doc.id === activeDocumentId) {
        return {
          ...doc,
          categoryId: categoryId,
          updatedAt: Date.now()
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocs);
  };

  // Add useEffect to handle Escape key globally
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close any open popups/modals
        if (showShortcuts) setShowShortcuts(false);
        if (showPlotHelp) setShowPlotHelp(false);
        if (showDocumentManager) setShowDocumentManager(false);
        if (showDocumentExport) setShowDocumentExport(false);
        if (showTagsManager) setShowTagsManager(false);
        if (showCategoriesManager) setShowCategoriesManager(false);
        if (showHistory) setShowHistory(false);
        if (showVariables) setShowVariables(false);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey as any);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleEscapeKey as any);
    };
  }, [
    showShortcuts, 
    showPlotHelp, 
    showDocumentManager, 
    showDocumentExport, 
    showTagsManager, 
    showCategoriesManager,
    showHistory,
    showVariables
  ]);

  // Function to handle outside clicks for panels
  const handlePanelOutsideClick = useCallback((e: MouseEvent) => {
    // Check if click is outside the panels
    const historyPanel = document.querySelector('.history-panel');
    const variablesPanel = document.querySelector('.variables-panel');
    
    if (showHistory && historyPanel && !historyPanel.contains(e.target as Node)) {
      setShowHistory(false);
    }
    
    if (showVariables && variablesPanel && !variablesPanel.contains(e.target as Node)) {
      setShowVariables(false);
    }
  }, [showHistory, showVariables]);

  // Add event listener for outside clicks on panels
  useEffect(() => {
    document.addEventListener('mousedown', handlePanelOutsideClick as any);
    
    return () => {
      document.removeEventListener('mousedown', handlePanelOutsideClick as any);
    };
  }, [showHistory, showVariables, handlePanelOutsideClick]);

  // Function to handle outside clicks for all modals
  const handleOutsideClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Make sure the click is directly on the modal-container element
    if (e.target === e.currentTarget) {
      // Close the appropriate modal based on the target element's classList
      if (e.currentTarget.classList.contains('shortcuts-modal')) {
        setShowShortcuts(false);
      } else if (e.currentTarget.classList.contains('plot-help-modal')) {
        setShowPlotHelp(false);
      } else if (e.currentTarget.classList.contains('document-manager-modal')) {
        setShowDocumentManager(false);
      } else if (e.currentTarget.classList.contains('document-export-modal')) {
        setShowDocumentExport(false);
      } else if (e.currentTarget.classList.contains('tags-manager-modal')) {
        setShowTagsManager(false);
      } else if (e.currentTarget.classList.contains('categories-manager-modal')) {
        setShowCategoriesManager(false);
      }
    }
  }, []);

  const checkForEquation = (currentText: string) => {
    const lines = currentText.split('\n');
    
    // Check for plot commands first
    const newPlots: PlotItem[] = [];
    const plotRegex = /^\s*plot\s*\(.*\)\s*$/i;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (plotRegex.test(line)) {
        newPlots.push({
          id: `plot-${lineIndex}-${Date.now()}`,
          command: line,
          lineIndex
        });
      }
    }
    
    // Update plots if changed
    if (JSON.stringify(newPlots.map(p => p.command)) !== JSON.stringify(plots.map(p => p.command))) {
      setPlots(newPlots);
    }
    
    // Check each line for equations ending with "="
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      // Skip lines that are plot commands
      if (plotRegex.test(line.trim())) continue;
      
      // Find the last mathematical expression before the equals sign
      const equalsPos = line.lastIndexOf('=');
      if (equalsPos >= 0 && equalsPos === line.trim().length - 1) {
        // Extract content before the equals sign
        let beforeEquals = line.substring(0, equalsPos).trim();
        
        // Try a progressive approach - start from the full string before equals,
        // then try progressively smaller chunks until we find one that evaluates
        let validExpression = '';
        let validResult = null;
        
        // Try the whole string first
        try {
          validResult = mathParserRef.current.evaluate(beforeEquals);
          validExpression = beforeEquals;
        } catch (error) {
          // If evaluating the whole string fails, try to find the longest valid expression
          // by checking for word boundaries and common delimiters
          
          // Split by common delimiters (could be refined based on your app's needs)
          const parts = beforeEquals.split(/[\s,;:`'"]+/).filter(Boolean);
          
          // Try combinations of parts, starting from the end
          for (let i = parts.length; i > 0; i--) {
            const testExpression = parts.slice(-i).join(' ').trim();
            
            // Skip empty strings or strings without any digits or variables
            if (!testExpression || !(/\d|[a-zA-Z]/.test(testExpression))) continue;
            
            try {
              validResult = mathParserRef.current.evaluate(testExpression);
              validExpression = testExpression;
              break; // Found a valid expression, stop checking
            } catch (error) {
              // This combination failed, continue with the next one
              continue;
            }
          }
        }
        
        // If we found a valid expression, create a suggestion
        if (validExpression && validResult !== null) {
          // Format the result appropriately based on its type
          let resultString: string;
          const resultType = typeOf(validResult);
          
          if (resultType === 'number') {
            if (Math.abs(validResult) < 1e-10 && validResult !== 0) {
              // Small numbers in scientific notation
              resultString = validResult.toExponential(4);
            } else if (Math.abs(validResult) >= 1e21) {
              // For extremely large numbers, use our custom formatter
              resultString = formatLargeNumber(validResult);
            } else if (Number.isInteger(validResult)) {
              // For integers, format with commas
              resultString = formatWithCommas(validResult);
            } else {
              // For decimal numbers with up to 4 decimal places
              const fixedValue = parseFloat(validResult.toFixed(4));
              resultString = formatWithCommas(fixedValue);
            }
          } else if (resultType === 'Complex') {
            // Format complex numbers (can't easily add commas)
            resultString = validResult.toString();
          } else if (resultType === 'Matrix') {
            // Format matrices in a readable way
            resultString = `\n${validResult.toString().replace(/],/g, '],\n ')}`;
          } else {
            // All other types
            resultString = validResult.toString();
          }
          
          // Set suggestion with correct position information
          setSuggestion({
            value: resultString,
            lineIndex,
            position: {
              start: equalsPos + 1,
              end: line.length
            }
          });
          
          // Return after finding the first equation
          return;
        }
      }
    }
    
    // No valid equations found
    setSuggestion(null);
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="app-title">SciNotepad</div>
        <div className="app-toolbar">
          <button 
            className={`toolbar-button ${showDocumentManager ? 'active' : ''}`}
            onClick={toggleDocumentManager}
            title={`Open document manager (${isMac ? '⌘' : 'Ctrl'}+O)`}
          >
            Documents
          </button>
          <button 
            className={`toolbar-button ${showDocumentExport ? 'active' : ''}`}
            onClick={toggleDocumentExport}
            title="Export or import documents"
          >
            Import/Export
          </button>
          <button 
            className={`toolbar-button ${showVariables ? 'active' : ''}`}
            onClick={() => setShowVariables(!showVariables)}
            title={`Toggle variables panel (${isMac ? '⌘' : 'Ctrl'}+B)`}
          >
            Variables
          </button>
          <button 
            className={`toolbar-button ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title={`Toggle history panel (${isMac ? '⌘' : 'Ctrl'}+U)`}
          >
            History
          </button>
          <button 
            className={`toolbar-button ${showTagsManager ? 'active' : ''}`}
            onClick={toggleTagsManager}
            title="Manage document tags"
          >
            Tags
          </button>
          <button 
            className={`toolbar-button ${showCategoriesManager ? 'active' : ''}`}
            onClick={toggleCategoriesManager}
            title="Manage document categories"
          >
            Categories
          </button>
          <button 
            className={`toolbar-button ${showShortcuts ? 'active' : ''}`}
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="View keyboard shortcuts"
          >
            Shortcuts
          </button>
          <button 
            className={`toolbar-button ${showPlotHelp ? 'active' : ''}`}
            onClick={() => setShowPlotHelp(!showPlotHelp)}
            title="Help with plotting"
          >
            Plot Help
          </button>
          <div className="format-selector">
            <select 
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value as 'international' | 'indian')}
              className="format-dropdown"
              title="Select number format style"
            >
              <option value="international">International Format (1,000,000)</option>
              <option value="indian">Indian Format (10,00,000)</option>
            </select>
          </div>
          <div className="save-status-indicator">
            {saveStatus === 'saving' && <span className="saving">Saving...</span>}
            {saveStatus === 'saved' && <span className="saved">Saved</span>}
            {saveStatus === 'error' && <span className="error">Save error!</span>}
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* New layout with editor and sidebar */}
        <div className="editor-sidebar-layout">
          {/* Editor container - takes 3/4 of the space */}
          <div className={`editor-container ${plots.length > 0 ? 'with-plots' : ''}`}>
            <SciEditor
              value={text}
              onChange={(value: string) => handleTextChange({ target: { value } } as React.ChangeEvent<HTMLTextAreaElement>)}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>)}
              suggestion={suggestion}
              variables={variables}
              editorRef={textareaRef}
              placeholder="Try these examples:
• 2 + 3 = 
• sin(45) = 
• x = 5
• y = x * 2 = 
• x + y = 
• plot(sin(x), -5, 5)
• plot(x^2, -10, 10)

Type equations ending with '=' to calculate instantly.
Variables can be defined and reused in later calculations.
Press Tab to accept suggestions."
            />
          </div>
          
          {/* Sidebar container - takes 1/4 of the space */}
          <div className="sidebar-container">


            {/* Render based on selected UI */}
            {useEnovateUI ? (
              <EnovateVariableDefinition 
                variableInput={variableInput}
                setVariableInput={setVariableInput}
                defineVariable={defineVariable}
                variables={variables}
                formatVariableValue={formatVariableValue}
                insertSymbol={insertSymbol}
                deleteVariable={deleteVariable}
              />
            ) : (
              <>
                {/* Regular Variable definition section */}
                <div className="variable-definition-section">
                  <div className="variable-definition-header">
                    <span className="var-section-icon">f(x)</span>
                    <h3 className="var-section-title">Define Variable</h3>
                  </div>
                  <div className="variable-input-container">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="e.g., x = 5"
                        value={variableInput}
                        onChange={(e) => setVariableInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && defineVariable()}
                        className="variable-input"
                      />
                      <button 
                        onClick={defineVariable}
                        className="variable-define-btn"
                        title="Define this variable"
                      >
                        Define
                      </button>
                    </div>
                    <div className="variable-help">
                      <span className="help-icon">ℹ️</span> 
                      <span>Format: <code>name = value</code><br/>(e.g. <code>x = 5</code>, <code>radius = 10.5</code>)</span>
                    </div>
                  </div>
                </div>

                {/* Current Variables Display */}
                {variables.length > 0 && (
                  <div className="current-variables-section">
                    <div className="section-title">Current Variables</div>
                    <div className="current-variables-list">
                      {variables.map((variable) => (
                        <div key={variable.name} className="current-variable-item">
                          <span className="variable-name">{variable.name}</span>
                          <span className="variable-value">= {formatVariableValue(variable)}</span>
                          <button
                            onClick={() => insertSymbol(variable.name)}
                            className="variable-use-btn"
                            title="Use this variable"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                      {variables.length > 5 && (
                        <div className="more-variables">
                          <button 
                            onClick={() => setShowVariables(true)}
                            className="show-all-variables-btn"
                          >
                            Show all ({variables.length})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plots container shown below the editor layout when plots exist */}
      {plots.length > 0 && (
        <div className="plots-container" ref={plotsContainerRef} style={{ marginBottom: "50px" }}>
          <h3 className="plots-header">Plots</h3>
          <div className="plots-grid">
            {plots.map(plot => (
              <PlotCommand 
                key={plot.id}
                command={plot.command}
                onClose={() => closePlot(plot.id)}
                variables={Object.fromEntries(variables.map(v => [v.name, v.value]))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        Built by Ranjeet Harichandre with <span className="heart">♥</span>
      </footer>
      
      {/* Utility panels */}
      {showHistory && (
        <div className="history-panel">
          <div className="panel-header">
            <div className="panel-title">Equation History</div>
            <button 
              className="panel-close-btn" 
              onClick={() => setShowHistory(false)}
            >
              ×
            </button>
          </div>
          <div className="history-items">
            {equationHistory.length === 0 ? (
              <div className="no-history">No equations calculated yet.</div>
            ) : (
              equationHistory
                .slice()
                .reverse()
                .map((item, index) => (
                  <div 
                    key={index} 
                    className="history-item"
                    onClick={() => insertFromHistory(item)}
                  >
                    <div className="history-expression">{item.expression}</div>
                    <div className="history-result">{item.result}</div>
                    <div className="history-time">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {showVariables && (
        <div className="variables-panel">
          <div className="panel-header">
            <div className="panel-title">Variables</div>
            <button 
              className="panel-close-btn" 
              onClick={() => setShowVariables(false)}
            >
              ×
            </button>
          </div>
          
          {useEnovateUI ? (
            // Enovate styled panel content
            <div style={{padding: "12px"}}>
              {/* New approach using inline styles for input container */}
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
              
              <div className="enovate-help" style={{marginTop: "10px", marginBottom: "15px"}}>
                <span>Format: <code>name = value</code></span>
              </div>
              
              {variables.length === 0 ? (
                <div className="enovate-empty-state">No variables defined yet.</div>
              ) : (
                <div className="enovate-variables-list" style={{
                  display: "flex", 
                  flexDirection: "column",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  {variables.map((variable) => (
                    <div key={variable.name} className="enovate-variable-item" style={{width: "100%"}}>
                      <span className="enovate-var-name">{variable.name}</span>
                      <span className="enovate-var-equals">=</span>
                      <span className="enovate-var-value">
                        {formatVariableValue(variable)}
                      </span>
                      <span style={{
                        color: "var(--text-secondary)", 
                        fontSize: "11px", 
                        marginLeft: "auto", 
                        marginRight: "6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {variable.type}
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
            </div>
          ) : (
            // Regular styled panel content
            <>
              <div className="variable-form">
                <input
                  type="text"
                  placeholder="e.g., x = 5"
                  value={variableInput}
                  onChange={(e) => setVariableInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && defineVariable()}
                />
                <button onClick={defineVariable}>Define</button>
              </div>
              <div className="variables-list">
                {variables.length === 0 ? (
                  <div className="no-variables">No variables defined yet.</div>
                ) : (
                  variables.map((variable) => (
                    <div key={variable.name} className="variable-item">
                      <div className="variable-details">
                        <div className="variable-name">{variable.name}</div>
                        <div className="variable-value">
                          = {formatVariableValue(variable)}
                        </div>
                        <div className="variable-type">{variable.type}</div>
                      </div>
                      <div className="variable-actions">
                        <button
                          onClick={() => insertSymbol(variable.name)}
                          title="Use this variable"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => deleteVariable(variable.name)}
                          title="Delete this variable"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showShortcuts && (
        <div className="shortcuts-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="shortcuts-content" onClick={(e) => e.stopPropagation()}>
            <h2>Keyboard Shortcuts</h2>
            <div className="shortcuts-list">
              <div className="shortcut-category">
                <h3>Navigation</h3>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> + <kbd>O</kbd>
                  </div>
                  <div className="shortcut-desc">Open document manager</div>
                </div>
              </div>
              
              <div className="shortcut-category">
                <h3>Mathematical Functions</h3>
                {keyboardShortcuts
                  .filter(shortcut => 
                    ['Insert π (Pi)', 'Insert e (Euler\'s number)', 'Insert sin() function', 
                     'Insert cos() function', 'Insert tan() function', 'Insert log() function', 
                     'Insert sqrt() function', 'Insert power operator (^)', 'Insert matrix template', 
                     'Insert plot template'].some(desc => shortcut.description.includes(desc))
                  )
                  .map((shortcut, index) => (
                    <div className="shortcut-item" key={`math-${index}`}>
                      <div className="shortcut-keys">
                        {shortcut.key.split('+').map((key, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="shortcut-plus">+</span>}
                            <kbd>{key.trim()}</kbd>
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="shortcut-desc">{shortcut.description}</div>
                    </div>
                  ))
                }
              </div>
              
              <div className="shortcut-category">
                <h3>Calculations</h3>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>Tab</kbd>
                  </div>
                  <div className="shortcut-desc">Accept calculation suggestion</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>Esc</kbd>
                  </div>
                  <div className="shortcut-desc">Dismiss suggestion</div>
                </div>
              </div>
              
              <div className="shortcut-category">
                <h3>Panels & Tools</h3>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> + <kbd>B</kbd>
                  </div>
                  <div className="shortcut-desc">Toggle variables panel</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> + <kbd>U</kbd>
                  </div>
                  <div className="shortcut-desc">Toggle history panel</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-keys">
                    <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> + <kbd>K</kbd>
                  </div>
                  <div className="shortcut-desc">Toggle shortcuts panel</div>
                </div>
              </div>
            </div>
            <button 
              className="close-btn" 
              onClick={() => setShowShortcuts(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Plot help modal */}
      {showPlotHelp && (
        <div className="plot-help-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PlotHelp 
              onClose={() => setShowPlotHelp(false)} 
              onInsertExample={insertExample}
            />
          </div>
        </div>
      )}

      {/* Document manager modal */}
      {showDocumentManager && (
        <div className="document-manager-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DocumentManager
              documents={documents}
              activeDocumentId={activeDocumentId}
              onDocumentSelect={handleDocumentSelect}
              onDocumentCreate={handleDocumentCreate}
              onDocumentDelete={handleDocumentDelete}
              onDocumentRename={handleDocumentRename}
              onClose={() => setShowDocumentManager(false)}
            />
          </div>
        </div>
      )}

      {/* Document export/import modal */}
      {showDocumentExport && (
        <div className="document-export-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DocumentExport
              documents={documents}
              activeDocument={getActiveDocument()}
              allTags={tags}
              allCategories={categories}
              onExportComplete={() => setShowDocumentExport(false)}
              onImportComplete={handleImportComplete}
              onClose={() => setShowDocumentExport(false)}
            />
          </div>
        </div>
      )}

      {/* Tags manager modal */}
      {showTagsManager && (
        <div className="tags-manager-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <TagsManager
              documentTags={getActiveDocument()?.tags || []}
              allTags={tags}
              onTagsUpdate={handleUpdateDocumentTags}
              onCreateTag={handleCreateTag}
              onClose={() => setShowTagsManager(false)}
            />
          </div>
        </div>
      )}

      {/* Categories manager modal */}
      {showCategoriesManager && (
        <div className="categories-manager-modal modal-container" onClick={(e) => handleOutsideClick(e)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CategoriesManager
              documentCategoryId={getActiveDocument()?.categoryId}
              allCategories={categories}
              onCategorySelect={handleSelectCategory}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              onClose={() => setShowCategoriesManager(false)}
            />
          </div>
        </div>
      )}

      {/* Error message display */}
      {errorMessage && (
        <div className="error-message-overlay">
          <div className="error-message-content">{errorMessage}</div>
        </div>
      )}
    </div>
  );
}

export default App;
