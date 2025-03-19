// src/components/Preferences.jsx
import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");
const Store = window.require("electron-store");
const store = new Store();

const Preferences = ({ open, onClose, darkMode, setDarkMode }) => {
  const [preferences, setPreferences] = useState({
    editor: {
      fontSize: 14,
      fontFamily: "Fira Code, monospace",
      tabSize: 4,
      insertSpaces: true,
      autoSave: false,
      formatOnSave: false,
      lineNumbers: true,
      wordWrap: true,
      minimap: true,
    },
    terminal: {
      fontSize: 14,
      fontFamily: "monospace",
    },
    ui: {
      theme: darkMode ? "dark" : "light",
      zoomFactor: 1,
    },
  });

  useEffect(() => {
    const savedPreferences = store.get("preferences");
    if (savedPreferences) setPreferences(savedPreferences);
  }, []);

  const handleChange = (section, key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = () => {
    store.set("preferences", preferences);
    if (preferences.ui.theme === "dark" && !darkMode) setDarkMode(true);
    else if (preferences.ui.theme === "light" && darkMode) setDarkMode(false);
    ipcRenderer.send("set-zoom-factor", preferences.ui.zoomFactor);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" style={overlayStyle}>
      <div className="dialog" style={dialogStyle}>
        <div style={dialogTitleStyle}>
          <h2>Preferences</h2>
        </div>
        <div style={dialogContentStyle}>
          <div style={sectionStyle}>
            <h3>Editor</h3>
            <hr />
            <div style={formControlStyle}>
              <label>Font Family</label>
              <select
                value={preferences.editor.fontFamily}
                onChange={(e) =>
                  handleChange("editor", "fontFamily", e.target.value)
                }
              >
                <option value="Fira Code, monospace">Fira Code</option>
                <option value="monospace">Monospace</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>
            <div style={formControlStyle}>
              <label>Font Size: {preferences.editor.fontSize}px</label>
              <input
                type="range"
                value={preferences.editor.fontSize}
                onChange={(e) =>
                  handleChange("editor", "fontSize", parseInt(e.target.value))
                }
                min={8}
                max={24}
                step={1}
              />
            </div>
            <div style={formControlStyle}>
              <label>Tab Size</label>
              <select
                value={preferences.editor.tabSize}
                onChange={(e) =>
                  handleChange("editor", "tabSize", parseInt(e.target.value))
                }
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.insertSpaces}
                  onChange={(e) =>
                    handleChange("editor", "insertSpaces", e.target.checked)
                  }
                />
                Insert Spaces
              </label>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.autoSave}
                  onChange={(e) =>
                    handleChange("editor", "autoSave", e.target.checked)
                  }
                />
                Auto Save
              </label>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.formatOnSave}
                  onChange={(e) =>
                    handleChange("editor", "formatOnSave", e.target.checked)
                  }
                />
                Format on Save
              </label>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.lineNumbers}
                  onChange={(e) =>
                    handleChange("editor", "lineNumbers", e.target.checked)
                  }
                />
                Line Numbers
              </label>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.wordWrap}
                  onChange={(e) =>
                    handleChange("editor", "wordWrap", e.target.checked)
                  }
                />
                Word Wrap
              </label>
            </div>
            <div style={formControlStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.editor.minimap}
                  onChange={(e) =>
                    handleChange("editor", "minimap", e.target.checked)
                  }
                />
                Minimap
              </label>
            </div>
          </div>
          <div style={sectionStyle}>
            <h3>Terminal</h3>
            <hr />
            <div style={formControlStyle}>
              <label>Font Family</label>
              <select
                value={preferences.terminal.fontFamily}
                onChange={(e) =>
                  handleChange("terminal", "fontFamily", e.target.value)
                }
              >
                <option value="monospace">Monospace</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Fira Code, monospace">Fira Code</option>
              </select>
            </div>
            <div style={formControlStyle}>
              <label>Font Size: {preferences.terminal.fontSize}px</label>
              <input
                type="range"
                value={preferences.terminal.fontSize}
                onChange={(e) =>
                  handleChange("terminal", "fontSize", parseInt(e.target.value))
                }
                min={8}
                max={24}
                step={1}
              />
            </div>
          </div>
          <div style={sectionStyle}>
            <h3>UI</h3>
            <hr />
            <div style={formControlStyle}>
              <label>Theme</label>
              <select
                value={preferences.ui.theme}
                onChange={(e) => handleChange("ui", "theme", e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div style={formControlStyle}>
              <label>Zoom Factor: {preferences.ui.zoomFactor}x</label>
              <input
                type="range"
                value={preferences.ui.zoomFactor}
                onChange={(e) =>
                  handleChange("ui", "zoomFactor", parseFloat(e.target.value))
                }
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>
          </div>
        </div>
        <div style={dialogActionsStyle}>
          <button onClick={onClose} style={{ marginRight: "8px" }}>
            Cancel
          </button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle = {
  background: "#fff",
  padding: "16px",
  borderRadius: "4px",
  width: "100%",
  maxWidth: "600px",
};

const dialogTitleStyle = {
  marginBottom: "8px",
};

const dialogContentStyle = {
  maxHeight: "70vh",
  overflowY: "auto",
};

const dialogActionsStyle = {
  textAlign: "right",
  marginTop: "16px",
};

const sectionStyle = {
  marginBottom: "16px",
};

const formControlStyle = {
  margin: "8px 0",
};

export default Preferences;
