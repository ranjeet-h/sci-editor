declare module 'ace-builds' {
  namespace ace {
    function require(moduleName: string): any;
  }
  export = ace;
}

declare module 'ace-builds/src-noconflict/mode-javascript' {}
declare module 'ace-builds/src-noconflict/mode-latex' {}
declare module 'ace-builds/src-noconflict/theme-tomorrow' {}
declare module 'ace-builds/src-noconflict/ext-language_tools' {
  interface Completion {
    caption: string;
    value: string;
    meta: string;
    score?: number;
    docText?: string;
  }

  interface Completer {
    getCompletions: (
      editor: any,
      session: any,
      pos: { row: number; column: number },
      prefix: string,
      callback: (err: any, completions: Completion[]) => void
    ) => void;
  }
} 