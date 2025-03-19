// src/components/StatusBar.jsx
import React from "react";
import "../styles/status-bar.css";

const StatusBar = ({ filePath, isModified, darkMode }) => {
  const getFileExtension = (path) => {
    if (!path) return "";
    const fileName = path.split(/[/\\]/).pop();
    const extension = fileName.split(".").pop();
    return extension;
  };

  const extension = getFileExtension(filePath);

  return (
    <div className={`status-bar ${darkMode ? "dark" : "light"}`}>
      <div className="status-item">
        {filePath ? (
          <span>
            {filePath.split(/[/\\]/).pop()}
            {isModified ? " •" : ""}
          </span>
        ) : (
          <span>No file open</span>
        )}
      </div>
      <div className="status-item">
        <span>{extension ? extension.toUpperCase() : ""}</span>
      </div>
      <div className="status-item">
        <span>UTF-8</span>
      </div>
      <div className="status-item">
        <span>LF</span>
      </div>
    </div>
  );
};

export default StatusBar;
