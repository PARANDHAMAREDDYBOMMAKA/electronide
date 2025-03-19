// src/components/Editor.jsx
import React, { useRef, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import "../styles/editor.css";

const Editor = ({ value, onChange, language, darkMode }) => {
  const editorRef = useRef(null);

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
    editor.updateOptions({
      fontFamily: "Fira Code, monospace",
      fontSize: 14,
      lineHeight: 20,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      cursorBlinking: "smooth",
      smoothScrolling: true,
      wordWrap: "on",
    });
  };

  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
    theme: darkMode ? "vs-dark" : "vs-light",
  };

  return (
    <div className="monaco-editor-container">
      {value !== undefined ? (
        <MonacoEditor
          language={language}
          theme={darkMode ? "vs-dark" : "vs-light"}
          value={value}
          options={options}
          onChange={onChange}
          editorDidMount={editorDidMount}
        />
      ) : (
        <div className="empty-editor">
          <p>Select a file to edit</p>
        </div>
      )}
    </div>
  );
};

export default Editor;
