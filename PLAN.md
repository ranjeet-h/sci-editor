# SciNotepad Project Plan

## 1. Overview
SciNotepad is a React + TypeScript based scientific notepad application that automatically detects mathematical equations typed by the user, evaluates them using `mathjs`, and suggests the result in-line. Users can accept the suggestion by pressing **Tab** or dismiss it with **Esc**.

## 2. Goals & Success Criteria
- ✅ Seamless equation detection and evaluation
- ✅ Clear in-app suggestion UI
- ✅ Intuitive keyboard interactions (Tab/Esc)
- ✅ Responsive and accessible design
- ✅ Well-structured, maintainable codebase

## 3. Technical Stack
- React ^19.1.0
- TypeScript
- `mathjs` for expression parsing & evaluation
- Rsbuild for bundling and development

## 4. Architecture & Components
1. **App Component** (`src/App.tsx`)
   - ✅ Manages note text state
   - ✅ Detects lines ending with `=`
   - ✅ Computes and tracks suggestion per line
   - ✅ Handles keyboard events for Tab/Esc
   - ✅ Manages equation history and variables
2. **Styling** (`src/App.css`)
   - ✅ Responsive textarea and suggestion box
   - ✅ Consistent theme and fonts
   - ✅ Scientific color palette based on readability research
   - ✅ Multi-device responsive design (mobile to ultra-wide)
3. **Mathematics Engine**
   - ✅ Expression parser/evaluator using `mathjs`
   - ✅ Support for complex functions and matrices
   - ✅ Intelligent formatting of different result types
   - ✅ Variable storage and reuse
4. **Document Management** (`src/components/DocumentManager.tsx`)
   - ✅ Create, rename, and delete documents
   - ✅ Search functionality for finding documents
   - ✅ Document switching with automatic saving
   - ✅ Visual feedback on document operations
   - ✅ Consistent styling and animations

## 5. Current Implementation Status

| Milestone | Description | Status |
|-----------|-------------|--------|
| 1. Project Setup | Initialize React+TypeScript, install dependencies | ✅ Done |
| 2. UI Skeleton | Create `App.tsx` & `App.css` with basic layout | ✅ Done |
| 3. Equation Detection | Implement regex to detect lines ending with `=` | ✅ Done |
| 4. Evaluation Engine | Integrate `mathjs` and compute results | ✅ Done |
| 5. Suggestion UI | Display calculated result inline near equal sign | ✅ Done |
| 6. Keyboard Handling | Map Tab to accept, Esc to dismiss | ✅ Done |
| 7. Scientific Functions | Support for trig, calculus, matrices, etc. | ✅ Done |
| 8. UI/UX Improvements | Optimized color scheme, fixed layout issues | ✅ Done |
| 9. Equation History | Track and recall previous calculations | ✅ Done |
| 10. Variable Storage | Define and reuse variables across calculations | ✅ Done |
| 11. Advanced Responsive | Optimize for all screen sizes from mobile to 4K | ✅ Done |
| 12. Accessibility | Enhance screen reader support and keyboard navigation | ✅ Done |
| 13. Error Handling | Improved user feedback for calculation errors | ✅ Done |
| 14. Local Storage | Save and restore notes, history, and variables | ✅ Done |
| 15. Keyboard Shortcuts | Cross-platform keyboard shortcuts for common functions | ✅ Done |
| 16. Plotting Capabilities | Visualize functions and data with integrated plots | ✅ Done |
| 17. Plot Help & Examples | Interactive documentation for plot functionality | ✅ Done |
| 18. Document Management | Multiple documents with search, rename, and delete | ✅ Done |
| 19. Real-time Save Status | Visual indicators for document saving status | ✅ Done |
| 20. Enhanced Document Management | Fixed document creation, selection, and switching | ✅ Done |
| 21. Improved Status Messages | Non-intrusive, animated status overlays | ✅ Done |

## 6. Key Features Implemented

### 6.1 Mathematical Evaluation System
- **Real-time Equation Detection**: Detects mathematical expressions as you type
- **Intelligent Formatting**: Different formatting for integers, floats, matrices, etc.
- **Scientific Functions**: Support for advanced math including:
  - Trigonometric functions (sin, cos, tan)
  - Logarithmic functions (log, ln)
  - Calculus (derivatives, integrals, summations)
  - Matrices (determinants, inverse, transpose)
  - Constants (pi, e, phi)
- **Variable Management**: Define, store, and reuse variables in calculations
- **Equation History**: Track and recall previously calculated expressions
- **Function Plotting**: Visualize mathematical functions with interactive 2D plots
- **Advanced Plot Support**: Customize plot parameters with syntax highlighting

### 6.2 User Interface
- **Clean, Scientific Layout**: Professional design based on scientific publication standards
- **Optimized Contrast**: Follows recommended contrast ratios (15-30% difference)
- **Quick-Access Symbols**: Organized palette of mathematical symbols and functions
- **Highly Responsive Design**: Optimized for all devices from mobile to ultra-wide displays
- **Multi-Column Layout**: Efficient space utilization on larger screens
- **Viewport-Based Scaling**: UI elements that scale proportionately with screen size
- **Modal Shortcuts Dialog**: Context-aware keyboard shortcuts reference
- **Platform-Adaptive UI**: Automatically shows macOS or Windows/Linux keyboard symbols
- **Interactive Function Visualization**: Plot mathematical functions directly in notes
- **Chart Customization**: Control plot range, points, and display options
- **Contextual Help**: On-demand documentation and examples for plotting
- **Save Status Indicator**: Fixed-width indicator showing document save state
- **Non-intrusive Notifications**: Status messages appear as overlays without shifting layout
- **Visual Feedback**: Clear feedback for document operations (create, rename, delete, switch)

### 6.3 User Experience
- **In-line Suggestions**: Results appear exactly where needed without disrupting layout
- **Tab to Accept**: Intuitive acceptance of suggestions with Tab key
- **Esc to Dismiss**: Easy dismissal of unwanted results
- **Non-Disruptive UI**: Fixed layout prevents content jumping when suggestions appear
- **Error Feedback**: Clear error messages for calculation problems
- **Accessible Design**: Screen reader support and keyboard navigation
- **Dynamic History Panel**: Access and reuse previous calculations
- **Cross-Platform Shortcuts**: Keyboard shortcuts optimized for macOS, Windows, and Linux
- **Persistent Storage**: User data preserved between sessions with local storage
- **Interactive Function Visualization**: Plot mathematical functions directly in notes
- **Chart Customization**: Control plot range, points, and display options
- **Plot Examples**: Pre-built examples that can be inserted with a click
- **Intelligent Plot Syntax**: Clear parameter structure with default values
- **Visual Documentation**: Interactive help and examples for plotting functions

### 6.4 Document Management
- **Multiple Documents**: Create and manage multiple scientific notes
- **Document Organization**: Name, rename, and delete documents as needed
- **Search Functionality**: Find documents by title or content
- **Document Switching**: Easily switch between different scientific notebooks
- **Persistent Storage**: All documents automatically saved to local storage
- **Document Preview**: See content previews before opening documents
- **Keyboard Navigation**: Quick access via Ctrl+O/⌘+O shortcut
- **Auto-saving**: Documents automatically save in real-time with visual feedback
- **Save Status Indicator**: Shows when documents are saving, saved, or encountered errors
- **Document Creation**: Create new documents with unique IDs and titles
- **Save Error Recovery**: Handles localStorage errors with appropriate fallbacks
- **Duplicate Name Prevention**: Prevents creating documents with duplicate names
- **Clear Status Messages**: Non-disruptive overlay notifications for all operations

## 7. Future Improvements

### 7.1 Enhanced Mathematics Features
- ✅ **Equation History**: Track and recall previously entered equations
- ✅ **Variable Storage**: Allow defining and reusing variables across calculations
- ✅ **Plotting Capabilities**: Visualize functions and data with integrated plotting
- **Unit Conversion**: Support for scientific units and automatic conversion
- **LaTeX Support**: Export equations in LaTeX format for publications

### 7.2 Document Management
- ✅ **Multiple Documents**: Support for working with multiple notes simultaneously
- ✅ **Document Searching**: Find documents by title or content
- ✅ **Real-time Saving**: Automatic saving with visual feedback
- **Cloud Synchronization**: Save and access notes across devices
- **Version History**: Track changes to documents over time
- **Export Options**: Export to PDF, LaTeX, HTML, or other formats
- **Document Tags/Categories**: Organize documents with tags or folders
- **Batch Operations**: Perform actions on multiple documents at once

### 7.3 Advanced Editor Features
- **Syntax Highlighting**: Color-code mathematical expressions and functions
- **Auto-Completion**: Suggest function names and parameters as you type
- **Code Folding**: Collapse sections of longer documents
- **Split View**: Edit and preview results side by side
- **Markdown Support**: Rich text formatting with markdown syntax

### 7.4 Collaboration Features
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Comments and Annotations**: Add notes to specific calculations
- **Sharing Options**: Share documents or specific calculations with colleagues
- **Export to Presentation**: Convert notes to presentation slides

### 7.5 Learning and Reference Tools
- **Formula Reference**: Searchable database of common formulas and equations
- **Interactive Tutorials**: Built-in guides for scientific calculations
- **Function Documentation**: Context-sensitive help for mathematical functions
- **Example Templates**: Pre-built templates for common scientific calculations

### 7.6 Performance Optimization
- **Calculation Caching**: Store results to avoid redundant calculations
- **Progressive Web App**: Offline functionality and improved performance
- **Web Worker Support**: Move heavy calculations off the main thread
- **Memory Management**: Optimize for working with large datasets or complex calculations

## 8. Technical Debt and Improvements
- **Testing Suite**: Add comprehensive unit and integration tests
- **Modular Architecture**: Refactor into smaller, specialized components
- ✅ **Accessibility Improvements**: Enhanced screen reader support and keyboard navigation
- **Internationalization**: Support for multiple languages and number formats
- ✅ **Documentation**: Complete API documentation and usage examples
- ✅ **Browser Compatibility**: Avoid conflicts with browser default shortcuts
- ✅ **Platform-Specific Adaptation**: Optimized UX for different operating systems

## 9. Timeline for Future Development
- **Short Term (1-2 months)**:
  - ✅ Implement equation history and variable storage
  - ✅ Fix edge cases
  - ✅ Improve accessibility
  - ✅ Documentation refinement
  - ✅ Implement local storage for persistence
  - ✅ Add keyboard shortcuts for common functions
  - ✅ Implement cross-platform shortcut compatibility
  - ✅ Create modal shortcuts help dialog
  - ✅ Add function plotting capabilities
  - ✅ Create interactive plot documentation and examples
  - ✅ Implement robust document management 
  - ✅ Add real-time document saving with status indicators

- **Medium Term (3-6 months)**:
  - ✅ Develop syntax highlighting and auto-completion
  - ✅ Support for LaTeX export
  - ✅ Implement document tags and categories
  - ✅ Add document import/export functionality

- **Long Term (6+ months)**:
  - ✅ Mobile responsive version

---

*Last updated on 2024-07-25*