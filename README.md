# SciNotepad

A scientific notepad application that automatically detects and evaluates mathematical expressions.

## Features

### Core Functionality
- **Automatic Equation Detection**: Type an equation ending with `=` and get immediate results
- **Smart Evaluation**: Powered by mathjs library for accurate mathematical calculations
- **Scientific Function Support**: Complex functions, trigonometry, calculus, matrices and more
- **Intuitive Interactions**: Accept suggestions with Tab, dismiss with Esc

### Advanced Features
- **Equation History**: Track and reuse previously entered equations
- **Variable Storage**: Define variables that persist across calculations
- **Mathematical Symbol Palette**: Quick access to common mathematical symbols and functions
- **Fully Responsive Design**: Optimized for all devices from mobile phones to ultra-wide monitors
- **Accessibility Features**: Screen reader support and keyboard navigation

## Getting Started

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build
```

## Usage Guide

### Basic Calculations
1. Type a mathematical expression ending with `=` (e.g., `2 + 2 =`)
2. A suggestion will appear showing the calculated result
3. Press **Tab** to accept the result or **Esc** to dismiss it

### Working with Variables
1. Click the "Variables" tab in the utility panel
2. Enter a variable definition like `x = 5` in the input field
3. Click "Define" to save the variable
4. Use the variable in your calculations (e.g., `x * 2 =`)
5. Click "Use" to insert a variable into your editor
6. Click "×" to delete a variable

### Using Equation History
1. Click the "Equation History" tab in the utility panel
2. View your previously calculated equations
3. Click any equation to insert it at the current cursor position

### Mathematical Functions
SciNotepad supports a wide range of functions:
- **Basic**: Addition, subtraction, multiplication, division
- **Trigonometry**: sin, cos, tan, asin, acos, atan
- **Functions**: log, ln, square root, exponents
- **Constants**: π, e, i, φ, ∞
- **Calculus**: Sum, integrate, derivative
- **Matrices**: Matrix creation, determinant, inverse, transpose

## Responsive Design

SciNotepad is designed to provide an optimal experience across all device sizes:

- **Mobile Devices**: Compact layout with touch-friendly controls
- **Tablets**: Balanced layout with improved readability
- **Desktop**: Full-featured layout with efficient use of screen space
- **Large Monitors**: Enhanced multi-column layout that scales up to 4K displays
- **Ultra-wide Screens**: Optimized maximum width to maintain readability

The application's UI elements automatically adapt to your device screen size, providing:

- Dynamic editor sizing that adjusts to your viewport
- Multi-column layouts on larger screens
- Proper spacing and typography at all sizes
- Smooth transitions between different screen sizes

## Project Structure

- `src/App.tsx` - Main application component
- `src/App.css` - Styling for the application
- `src/index.tsx` - Entry point

## Recent Improvements

- Added equation history functionality
- Implemented variable storage and management
- Fixed edge cases in equation detection and evaluation
- Enhanced accessibility with ARIA attributes and keyboard navigation
- Improved responsiveness for all device sizes from mobile to ultra-wide displays
- Added better error handling with user-friendly error messages
- Implemented flexible viewport-based sizing for UI elements

## License

MIT
