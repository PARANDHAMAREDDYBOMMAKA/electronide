// src/components/FileExplorer.jsx
import React, { useState, useEffect } from "react";
import "../styles/file-explorer.css";
const { ipcRenderer } = window.require("electron");

const FileExplorer = ({ rootFolder, onFileSelect }) => {
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    if (rootFolder) loadDirectory(rootFolder);
  }, [rootFolder]);

  const loadDirectory = async (dirPath) => {
    try {
      const items = await ipcRenderer.invoke("read-directory", dirPath);
      setTree(items);
    } catch (error) {
      console.error("Error loading directory:", error);
    }
  };

  const fetchChildrenIfNeeded = async (node, isExpanding) => {
    if (
      isExpanding &&
      node.isDirectory &&
      (!node.children || node.children.length === 0)
    ) {
      try {
        const children = await ipcRenderer.invoke("read-directory", node.path);
        setTree((prevTree) =>
          updateTreeNode(prevTree, node.path, { children })
        );
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    }
  };

  const updateTreeNode = (nodes, path, updates) => {
    return nodes.map((node) => {
      if (node.path === path) return { ...node, ...updates };
      if (node.children)
        return {
          ...node,
          children: updateTreeNode(node.children, path, updates),
        };
      return node;
    });
  };

  const handleToggle = (nodeId) => {
    setExpanded((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleNodeSelect = async (nodeId) => {
    const findNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.path === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedNode = findNode(tree, nodeId);
    if (selectedNode) {
      if (selectedNode.isDirectory) {
        handleToggle(nodeId);
        await fetchChildrenIfNeeded(selectedNode, !expanded.includes(nodeId));
      } else {
        onFileSelect(selectedNode.path);
      }
    }
  };

  const renderTree = (nodes) => {
    return (
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {nodes.map((node) => (
          <li key={node.path}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => handleNodeSelect(node.path)}
            >
              {node.isDirectory ? (
                <span style={{ marginRight: "4px" }}>
                  {expanded.includes(node.path) ? "▼" : "►"}
                </span>
              ) : (
                <span style={{ width: "14px", display: "inline-block" }}></span>
              )}
              <span style={{ marginRight: "4px" }}>
                {node.isDirectory ? "📁" : "📄"}
              </span>
              <span>{node.name}</span>
            </div>
            {node.isDirectory &&
              node.children &&
              expanded.includes(node.path) && (
                <div style={{ paddingLeft: "16px" }}>
                  {renderTree(node.children)}
                </div>
              )}
          </li>
        ))}
      </ul>
    );
  };

  if (!rootFolder) {
    return (
      <div className="no-folder-message">
        <p>No folder opened. Use File → Open Folder to get started.</p>
      </div>
    );
  }

  return (
    <div className="file-explorer-container">
      <div className="file-explorer-header">
        <span>{rootFolder.split(/[/\\]/).pop()}</span>
      </div>
      <div>{renderTree(tree)}</div>
    </div>
  );
};

export default FileExplorer;
