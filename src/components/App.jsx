// src/components/App.jsx
import React, { useState, useEffect } from "react";
import Split from "split.js";
import FileExplorer from "./FileExplorer";
import Editor from "./Editor";
import StatusBar from "./StatusBar";
import Terminal from "./Terminal";
import Search from "./Search";
import Preferences from "./Preferences";
import { getLanguageFromFileName } from "../utils/fileUtils";
import "../styles/app.css";
const { ipcRenderer } = require("electron");

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [openedFolder, setOpenedFolder] = useState(null);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (document.getElementById("split-container")) {
      Split(["#file-explorer", "#editor-container"], {
        sizes: [20, 80],
        minSize: [200, 300],
        gutterSize: 8,
        cursor: "col-resize",
      });
    }

    if (showTerminal && document.getElementById("main-terminal-split")) {
      Split(["#main-content", "#terminal-container"], {
        sizes: [70, 30],
        minSize: [300, 100],
        gutterSize: 8,
        direction: "vertical",
        cursor: "row-resize",
      });
    }

    ipcRenderer.on("folder-opened", (event, folderPath) => {
      setOpenedFolder(folderPath);
    });

    ipcRenderer.on("file-opened", (event, { path, content }) => {
      handleFileOpen(path, content);
    });

    ipcRenderer.on("save-requested", () => {
      if (activeFile) handleSaveFile(activeFile.path, editorContent);
    });

    ipcRenderer.on("save-as-requested", async () => {
      const filePath = await ipcRenderer.invoke("save-dialog");
      if (filePath) handleSaveFile(filePath, editorContent);
    });

    return () => {
      ipcRenderer.removeAllListeners("folder-opened");
      ipcRenderer.removeAllListeners("file-opened");
      ipcRenderer.removeAllListeners("save-requested");
      ipcRenderer.removeAllListeners("save-as-requested");
    };
  }, [activeFile, editorContent, showTerminal]);

  const handleFileOpen = (filePath, content) => {
    const fileExists = openedFiles.find((f) => f.path === filePath);
    if (!fileExists) {
      const newFile = { path: filePath, name: filePath.split(/[/\\]/).pop() };
      setOpenedFiles([...openedFiles, newFile]);
      setActiveFile(newFile);
    } else {
      setActiveFile(fileExists);
    }
    setEditorContent(content);
    setIsModified(false);
  };

  const handleFileSelect = async (filePath, lineNumber) => {
    try {
      const content = await ipcRenderer.invoke("read-file", filePath);
      handleFileOpen(filePath, content);
      if (lineNumber && window.editor) {
        window.editor.revealLineInCenter(lineNumber);
        window.editor.setPosition({ lineNumber, column: 1 });
        window.editor.focus();
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleSaveFile = async (filePath, content) => {
    try {
      await ipcRenderer.invoke("write-file", { filePath, content });
      setIsModified(false);
      if (!openedFiles.find((f) => f.path === filePath)) {
        const newFile = { path: filePath, name: filePath.split(/[/\\]/).pop() };
        setOpenedFiles([...openedFiles, newFile]);
        setActiveFile(newFile);
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setIsModified(true);
  };

  const handleTabClose = (filePath) => {
    const newOpenedFiles = openedFiles.filter((f) => f.path !== filePath);
    setOpenedFiles(newOpenedFiles);
    if (activeFile && activeFile.path === filePath) {
      const newActiveFile =
        newOpenedFiles.length > 0 ? newOpenedFiles[0] : null;
      setActiveFile(newActiveFile);
      if (newActiveFile) handleFileSelect(newActiveFile.path);
      else {
        setEditorContent("");
        setIsModified(false);
      }
    }
  };

  const toggleTerminal = () => setShowTerminal(!showTerminal);
  const toggleSearch = () => setShowSearch(!showSearch);
  const togglePreferences = () => setShowPreferences(!showPreferences);

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <div
        className="app-bar"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          background: darkMode ? "#333" : "#eee",
        }}
      >
        <h1 style={{ flexGrow: 1 }}>Simple IDE</h1>
        <button onClick={toggleSearch} style={{ margin: "0 4px" }}>
          🔍
        </button>
        <button onClick={toggleTerminal} style={{ margin: "0 4px" }}>
          ⌨
        </button>
        <button onClick={togglePreferences} style={{ margin: "0 4px" }}>
          ⚙
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ margin: "0 4px" }}
        >
          {darkMode ? "🌞" : "🌜"}
        </button>
      </div>
      <div
        className="tabs"
        style={{ display: "flex", borderBottom: "1px solid #ccc" }}
      >
        {openedFiles.map((file) => (
          <div
            key={file.path}
            className={`tab ${
              activeFile && activeFile.path === file.path ? "active" : ""
            }`}
            onClick={() => handleFileSelect(file.path)}
            style={{
              padding: "8px",
              cursor: "pointer",
              borderRight: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>
              {file.name}
              {isModified && activeFile && activeFile.path === file.path
                ? "*"
                : ""}
            </span>
            <button
              className="close-tab"
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(file.path);
              }}
              style={{ marginLeft: "4px", cursor: "pointer" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div
        id="main-terminal-split"
        className="content-container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 100px)",
        }}
      >
        <div id="main-content" className="main-content" style={{ flex: 1 }}>
          <div
            id="split-container"
            className="content-container"
            style={{ display: "flex", height: "100%" }}
          >
            <div
              id="file-explorer"
              className="file-explorer"
              style={{ width: "20%", borderRight: "1px solid #ccc" }}
            >
              <FileExplorer
                rootFolder={openedFolder}
                onFileSelect={handleFileSelect}
              />
            </div>
            <div
              id="editor-container"
              className="editor-container"
              style={{ flex: 1 }}
            >
              {showSearch ? (
                <Search
                  folderPath={openedFolder}
                  onFileSelect={handleFileSelect}
                  onClose={toggleSearch}
                />
              ) : (
                <Editor
                  value={editorContent}
                  onChange={handleEditorChange}
                  language={
                    activeFile
                      ? getLanguageFromFileName(activeFile.name)
                      : "plaintext"
                  }
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>
        </div>
        {showTerminal && (
          <div
            id="terminal-container"
            className="terminal-container"
            style={{ height: "200px", borderTop: "1px solid #ccc" }}
          >
            <Terminal
              darkMode={darkMode}
              workingDirectory={openedFolder}
              onClose={toggleTerminal}
            />
          </div>
        )}
      </div>
      <StatusBar
        filePath={activeFile ? activeFile.path : ""}
        isModified={isModified}
        darkMode={darkMode}
      />
      <Preferences
        open={showPreferences}
        onClose={togglePreferences}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
};

export default App;
