declare module 'react-ace' {
  import * as React from 'react';
  
  export interface IAceEditorProps {
    mode?: string;
    theme?: string;
    name?: string;
    className?: string;
    height?: string;
    width?: string;
    fontSize?: number;
    showGutter?: boolean;
    showPrintMargin?: boolean;
    highlightActiveLine?: boolean;
    focus?: boolean;
    value?: string;
    defaultValue?: string;
    onLoad?: (editor: any) => void;
    onChange?: (value: string, event?: any) => void;
    onSelection?: (selectedText: string, event?: any) => void;
    onCopy?: (text: string) => void;
    onPaste?: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onScroll?: (editor: any) => void;
    editorProps?: any;
    setOptions?: any;
    keyboardHandler?: string;
    commands?: any[];
    annotations?: any[];
    markers?: any[];
    onKeyDown?: (event: React.KeyboardEvent) => void;
  }
  
  export default class AceEditor extends React.Component<IAceEditorProps> {
    editor: any;
  }
} 