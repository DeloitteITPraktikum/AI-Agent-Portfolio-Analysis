import React, { useState, useRef, useContext } from "react";
import ToastContext from "../ToastContext";
import { useData } from "../context/DataContext";

// Hilfsfunktion: CSV → Array von Objekten
const parseCSV = (text) => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ? values[i].trim() : "";
      return obj;
    }, {});
  });
};

const CsvUpload = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [columns, setColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const fileInputRef = useRef(null);
  const { showToast } = useContext(ToastContext);
  const { updatePortfolioData, clearPortfolioData } = useData();

  // Validierung der CSV — liefert gültige Daten + Fehlerprotokoll

  /**
 * Simple CSV parser (no quoted commas).
 * Converts CSV text into:
 *  { headers: [...], rows: [ {col1:value1, col2:value2...}, ... ] }
 */
function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = cells[index] ? cells[index].trim() : "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Validate a CSV file:
 * 1) Ensure required columns: Ticker, Gewichtung
 * 2) Ensure all Gewichtung values are between 0 and 1
 * 3) Ensure the sum of Gewichtung ≈ 1 (with tolerance)
 * 4) Allow any additional columns (Kaufpreis, Anzahl, etc.)
 *
 * @param {string} csvText - CSV file content as text
 * @param {number} tolerance - allowed deviation for sum=1 (default 1e-6)
 * @returns {{ valid: boolean, messages: string[] }}
 */
function validateCsvText(csvText, tolerance = 1e-6) {
  const result = { valid: true, messages: [] };

  try {
    const { headers, rows } = parseCsv(csvText);

    
    const required = new Set(["Ticker", "Gewichtung"]);
    const headerSet = new Set(headers);

    const missing = [...required].filter(col => !headerSet.has(col));
    if (missing.length > 0) {
      result.valid = false;
      result.messages.push("Missing required columns: " + missing.join(", "));
    }
 
    if (headerSet.has("Gewichtung")) {
      const weights = rows.map(row => parseFloat(row["Gewichtung"]));

      
      const validRange = weights.every(v => !isNaN(v) && v >= 0 && v <= 1);
      if (!validRange) {
        result.valid = false;
        result.messages.push("Some 'Gewichtung' values are outside 0–1 or not numeric.");
      }

      
      const total = weights.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
      if (Math.abs(total - 1) > tolerance) {
        result.valid = false;
        result.messages.push(
          `The sum of 'Gewichtung' must be 1 (±${tolerance}). Current sum = ${total}.`
        );
      }
    }

    
    if (result.valid && result.messages.length === 0) {
      result.messages.push("CSV file is valid.");
    }

  } catch (err) {
    result.valid = false;
    result.messages.push("Error parsing CSV: " + err.message);
  }

  return result;
}


  // Funktion zum Starten der Analyse
  const handleAnalyze = () => {
    if (data.length === 0) return;
    
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      showToast("Analyse erfolgreich. Kennzahlen aktualisiert.");
    }, 2000);
  };

  // Datei-Upload
  const processFile = (file) => {
    if (!file || !file.name) return;

    if (!file.name.endsWith(".csv")) {
      setError("Bitte eine gültige CSV-Datei hochladen.");
      setData([]);
      clearPortfolioData();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);

      const { errors, validRows } = validateCsvText(Text)

;

      if (errors.length > 0) {
        setError(errors);
        clearPortfolioData();
      } else {
        setError("");
        updatePortfolioData(validRows);
      }

      setData(validRows);
      setColumns(validRows.length > 0 ? Object.keys(validRows[0]) : []);
      if (validRows.length > 0) setUploaded(true);
    };
    reader.readAsText(file);
  };

  // Drag & Drop Events
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReplaceFile = () => {
    setUploaded(false);
    setData([]);
    setError("");
    clearPortfolioData();
  };

  return (
    <div>
      <h3 className="upload-title">CSV-Upload</h3>

      {!uploaded ? (
        <div
          className={`upload-dropzone ${isDragging ? "drag-active" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              fileInputRef.current.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">+</div>
          <div className="upload-text">Datei hochladen bzw. hierher ziehen</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="upload-input"
            onChange={(e) => processFile(e.target.files[0])}
          />
        </div>
      ) : (
        !error && data.length > 0 && (
          <div className="mt-4">
            <span className="upload-badge">
              Datei erfolgreich hochgeladen – {data.length} Zeilen verarbeitet
            </span>

            <table className="csv-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>
                        {col === "Kaufpreis"
                          ? Number(row[col]).toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) + " €"
                          : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="csv-footnote">
              Nur die ersten 5 Zeilen werden angezeigt
            </p>

            <button
              className="replace-csv-btn"
              onClick={handleReplaceFile}
            >
              Neue Datei wählen
            </button>
          </div>
        )
      )}

      {error && (
        <div className="error-badge">
          {Array.isArray(error) ? error.join(", ") : error}
        </div>
      )}

      <div className="analyze-section">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || data.length === 0 || error}
          className={`analyze-button ${
            isAnalyzing || data.length === 0 || error
              ? "analyze-button-disabled"
              : "analyze-button-active"
          }`}
        >
          {isAnalyzing ? "Analyse läuft..." : "Analyse starten"}
        </button>
      </div>
    </div>
  );
};

export default CsvUpload;