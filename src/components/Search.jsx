// src/components/Search.jsx
import React, { useState } from "react";
const { ipcRenderer } = window.require("electron");

const Search = ({ folderPath, onFileSelect, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  const handleSearch = async () => {
    if (!searchText || !folderPath) return;
    setIsSearching(true);
    try {
      const results = await ipcRenderer.invoke("search-in-files", {
        folderPath,
        searchText,
      });
      setSearchResults(results);
      if (results.length > 0) setCurrentResultIndex(0);
    } catch (error) {
      console.error("Error searching files:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResultSelect = (result) => {
    onFileSelect(result.filePath, result.lineNumber);
  };

  const handleNextResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    handleResultSelect(searchResults[nextIndex]);
  };

  const handlePrevResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex =
      (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    handleResultSelect(searchResults[prevIndex]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "4px" }}>
        <input
          type="text"
          placeholder="Search in files"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ flex: 1, padding: "4px" }}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          style={{ padding: "4px", marginLeft: "4px" }}
        >
          🔍
        </button>
        <span
          style={{
            margin: "0 8px",
            borderLeft: "1px solid #ccc",
            height: "28px",
          }}
        ></span>
        <button onClick={onClose} style={{ padding: "4px" }}>
          ×
        </button>
      </div>
      {searchResults.length > 0 && (
        <>
          <div
            style={{ padding: "8px", display: "flex", alignItems: "center" }}
          >
            <span>{searchResults.length} results</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={handlePrevResult} style={{ padding: "4px" }}>
                ←
              </button>
              <button onClick={handleNextResult} style={{ padding: "4px" }}>
                →
              </button>
            </div>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((result, index) => (
              <li
                key={`${result.filePath}-${result.lineNumber}`}
                style={{
                  padding: "8px",
                  background:
                    index === currentResultIndex ? "#ddd" : "transparent",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => {
                  setCurrentResultIndex(index);
                  handleResultSelect(result);
                }}
              >
                <div>
                  <strong>{result.filePath.split(/[/\\]/).pop()}</strong>
                </div>
                <div>
                  <small>
                    Line {result.lineNumber}: {result.matchText}
                  </small>
                </div>
                <div>
                  <small>{result.filePath}</small>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {isSearching && (
        <div style={{ padding: "16px", textAlign: "center" }}>
          <span>Searching...</span>
        </div>
      )}
      {!isSearching && searchResults.length === 0 && searchText !== "" && (
        <div style={{ padding: "16px", textAlign: "center" }}>
          <span>No results found</span>
        </div>
      )}
    </div>
  );
};

export default Search;
