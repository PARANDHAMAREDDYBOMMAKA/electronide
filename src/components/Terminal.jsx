// src/components/Terminal.jsx
import React, { useEffect, useRef, useState } from "react";
const { ipcRenderer } = window.require("electron");

const Terminal = ({ workingDirectory, darkMode, onClose }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleTerminalOutput = (event, { command, output, isError }) => {
      setCommandHistory((prev) => [
        ...prev,
        { type: "command", content: command },
        { type: isError ? "error" : "output", content: output },
      ]);
      setIsRunning(false);
      scrollToBottom();
    };
    ipcRenderer.on("terminal-output", handleTerminalOutput);
    return () => {
      ipcRenderer.removeListener("terminal-output", handleTerminalOutput);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) scrollToBottom();
  }, [commandHistory]);

  const scrollToBottom = () => {
    if (contentRef.current)
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!currentCommand.trim() || isRunning) return;
    setIsRunning(true);
    ipcRenderer.invoke("execute-command", {
      command: currentCommand,
      cwd: workingDirectory,
    });
    setCurrentCommand("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateHistory(1);
    }
  };

  const navigateHistory = (direction) => {
    const commands = commandHistory
      .filter((entry) => entry.type === "command")
      .map((entry) => entry.content);
    if (commands.length === 0) return;
    let newIndex = historyIndex + direction;
    if (newIndex < -1) newIndex = -1;
    if (newIndex >= commands.length) newIndex = commands.length - 1;
    setHistoryIndex(newIndex);
    setCurrentCommand(
      newIndex === -1 ? "" : commands[commands.length - 1 - newIndex]
    );
  };

  const handleClear = () => {
    setCommandHistory([]);
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "4px 8px",
    backgroundColor: darkMode ? "#252526" : "#e0e0e0",
  };

  const contentStyle = {
    flex: 1,
    overflow: "auto",
    padding: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    color: darkMode ? "#d4d4d4" : "#333",
    backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5",
  };

  const inputStyle = {
    width: "100%",
    padding: "4px 8px",
    backgroundColor: "transparent",
    border: "none",
    color: darkMode ? "#d4d4d4" : "#333",
    fontFamily: "monospace",
    fontSize: "14px",
    outline: "none",
  };

  const terminalStyle = {
    height: "200px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: darkMode ? "#1e1e1e" : "#f0f0f0",
    borderTop: darkMode ? "1px solid #555" : "1px solid #ccc",
  };

  const promptStyle = {
    display: "flex",
    alignItems: "center",
    padding: "4px 0",
  };
  const promptSymbolStyle = {
    marginRight: "8px",
    color: darkMode ? "#569cd6" : "#007acc",
  };
  const outputStyle = {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: "4px 0",
  };
  const titleStyle = { flexGrow: 1 };
  const iconButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    fontSize: "16px",
  };

  return (
    <div style={terminalStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Terminal</span>
        <button style={iconButtonStyle} onClick={handleClear}>
          ⟳
        </button>
        <button style={iconButtonStyle} onClick={onClose}>
          ×
        </button>
      </div>
      <div ref={contentRef} style={contentStyle}>
        {commandHistory.map((entry, index) => (
          <div
            key={index}
            style={{
              ...outputStyle,
              color:
                entry.type === "error"
                  ? "#f44336"
                  : entry.type === "command"
                  ? "#569cd6"
                  : undefined,
            }}
          >
            {entry.type === "command" ? `$ ${entry.content}` : entry.content}
          </div>
        ))}
        <form onSubmit={handleCommandSubmit} style={promptStyle}>
          <span style={promptSymbolStyle}>$</span>
          <input
            ref={inputRef}
            type="text"
            style={inputStyle}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal;
