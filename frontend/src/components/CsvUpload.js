// src/components/CsvUpload.js
import React, { useState, useRef } from "react";

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

  const fileInputRef = useRef(null);

  // Validierung der CSV — liefert gültige Daten + Fehlerprotokoll
  const validateCSV = (parsedData) => {
    const expected = ["Ticker", "Anzahl", "Kaufpreis"];
    const headers = Object.keys(parsedData[0] || {});
    const missing = expected.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
      return { errors: [`Fehlende Spalten: ${missing.join(", ")}`], validRows: [] };
    }

    const errors = [];
    const validRows = [];

    parsedData.forEach((row, index) => {
      const rowNr = index + 2; // +2 wegen Header + 1-based index

      if (!row.Ticker || !row.Anzahl || !row.Kaufpreis) {
        errors.push(`Zeile ${rowNr}: Ein oder mehrere Felder sind leer.`);
        return;
      }

      if (isNaN(Number(row.Anzahl))) {
        errors.push(`Zeile ${rowNr}: Anzahl ist keine gültige Zahl.`);
        return;
      }

      if (isNaN(Number(row.Kaufpreis))) {
        errors.push(`Zeile ${rowNr}: Kaufpreis ist keine gültige Zahl.`);
        return;
      }

      // Wenn alles ok → Zeile übernehmen
      validRows.push(row);
    });

    return { errors, validRows };
  };

  // Funktion zum Starten der Analyse
  const handleAnalyze = () => {
    if (data.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Hier würde die Analyse-Logik implementiert werden
    console.log("Starte Analyse mit Daten:", data);
    
    // Simuliere eine Analyse (ersetze dies mit deiner echten Analyse-Logik)
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("Analyse abgeschlossen! Die Portfolio-Kennzahlen wurden aktualisiert.");
      // Hier könntest du die Dashboard-Kennzahlen aktualisieren
    }, 2000);
  };

  // Datei-Upload
  const processFile = (file) => {
    // Wenn kein File existiert → sofort abbrechen
    if (!file || !file.name) {
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Bitte eine gültige CSV-Datei hochladen.");
      setData([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);

      const { errors, validRows } = validateCSV(parsed);

      if (errors.length > 0) {
        setError(errors);  // mehrere Fehler!
      } else {
        setError(""); // Keine Fehler vorhanden
      }

      // gültige Zeilen speichern – auch wenn Fehler existieren
      setData(validRows);
      setColumns(validRows.length > 0 ? Object.keys(validRows[0]) : []);
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

  return (
    <div>

      {/* CSV Upload Titel */}
      <h3 className="upload-title">CSV-Upload</h3>

      {/* Upload Dropzone */}
      <div
        className={`upload-dropzone ${isDragging ? "drag-active" : ""}`}
        onClick={(e) => {
          // Nur öffnen, wenn NICHT auf das unsichtbare Input geklickt wurde
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

      {/* Fehlermeldung */}
      {error && (
        <div className="error-badge">
          {Array.isArray(error) ? error.join(", ") : error}
        </div>
      )}

      {/* Erfolgreiche Tabelle */}
      {!error && data.length > 0 && (
        <div className="mt-4">
          <span className="upload-badge">
            Datei erfolgreich hochgeladen – {data.length} Zeilen verarbeitet
          </span>

          <table className="csv-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border px-2 py-1 bg-gray-100 text-left"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col} className="border px-2 py-1">
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
        </div>
      )}

      {/* Analyse starten Button */}
      <div className="analyze-section">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || data.length === 0 || error}
          className={`analyze-button ${isAnalyzing || data.length === 0 || error ? "analyze-button-disabled" : "analyze-button-active"}`}
        >
          {isAnalyzing ? "Analyse läuft..." : "Analyse starten"}
        </button>
      </div>

    </div>
  );
};

export default CsvUpload;