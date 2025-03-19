// src/utils/fileUtils.js
const path = require("path");

/**
 * Get the appropriate icon for a file based on its extension
 * @param {string} fileName - The name of the file
 * @returns {string} - The name of the icon to use
 */
const getFileIcon = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const iconMap = {
    js: "javascript",
    jsx: "react",
    ts: "typescript",
    tsx: "react",
    html: "html",
    css: "css",
    scss: "sass",
    json: "json",
    md: "markdown",
    py: "python",
    rb: "ruby",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    php: "php",
    swift: "swift",
    rs: "rust",
  };
  return iconMap[extension] || "document";
};

/**
 * Get the appropriate language mode for Monaco editor based on file extension
 * @param {string} fileName - The name of the file
 * @returns {string} - The language mode for Monaco editor
 */
const getLanguageFromFileName = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    md: "markdown",
    py: "python",
    rb: "ruby",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    php: "php",
    swift: "swift",
    rs: "rust",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sh: "shell",
    bash: "shell",
    txt: "plaintext",
  };
  return languageMap[ext] || "plaintext";
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get the basename of a file path
 * @param {string} filePath - The full file path
 * @returns {string} - The basename of the file
 */
const getBasename = (filePath) => {
  return path.basename(filePath);
};

/**
 * Get the directory of a file path
 * @param {string} filePath - The full file path
 * @returns {string} - The directory of the file
 */
const getDirname = (filePath) => {
  return path.dirname(filePath);
};

/**
 * Check if a file is hidden (starts with a dot)
 * @param {string} fileName - The name of the file
 * @returns {boolean} - True if the file is hidden
 */
const isHiddenFile = (fileName) => {
  return fileName.startsWith(".");
};

module.exports = {
  getFileIcon,
  getLanguageFromFileName,
  formatFileSize,
  getBasename,
  getDirname,
  isHiddenFile,
};
