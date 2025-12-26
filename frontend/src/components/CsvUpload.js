// src/components/CsvUpload.js
import React, { useState, useRef, useContext } from "react";
import ToastContext from "../ToastContext";
import { useData } from "../context/DataContext";

// Upload ins Volume über euer FastAPI-Backend
const uploadCsvToVolume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/upload-csv", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorText = "";
    try {
      const errJson = await response.json();
      errorText = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorText = await response.text();
    }
    throw new Error(
      `Upload fehlgeschlagen (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  console.log("📁 CSV im Volume gespeichert:", data.path);
  return data.path;
};

// CSV → Array von Objekten
const parseCSV = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ? values[i].trim() : "";
      return obj;
    }, {});
  });
};

// Zahl-Parser, der auch "123,45" versteht
const parseNumber = (value) => {
  if (value === null || value === undefined) return NaN;
  const normalized = String(value).replace(",", ".").trim();
  if (normalized === "") return NaN;
  return Number(normalized);
};

// Validierung + neue Spalten hinzufügen
// Pflicht: Ticker, Kaufpreis, Anzahl, Kaufdatum
// Optional: Gesamtpreis (sonst Kaufpreis * Anzahl)
const validateAndTransformCSV = (parsedData) => {
  const errors = [];

  if (!parsedData || parsedData.length === 0) {
    errors.push("Die CSV-Datei enthält keine Daten.");
    return { errors, validRows: [] };
  }

  const requiredColumns = ["Ticker", "Kaufpreis", "Anzahl", "Kaufdatum"];
  const firstRow = parsedData[0];

  const missing = requiredColumns.filter(
    (col) => !(col in firstRow || col.toLowerCase() in firstRow)
  );
  if (missing.length > 0) {
    errors.push(`Folgende Spalten fehlen in der CSV: ${missing.join(", ")}.`);
    return { errors, validRows: [] };
  }

  const validRows = [];

  parsedData.forEach((row, index) => {
    const rowNr = index + 2;
    const get = (name) => row[name] ?? row[name.toLowerCase()] ?? "";

    const ticker = String(get("Ticker")).trim();
    const kaufpreisRaw = get("Kaufpreis");
    const anzahlRaw = get("Anzahl");
    const kaufdatum = String(get("Kaufdatum")).trim();
    const gesamtpreisRaw = get("Gesamtpreis");

    const kaufpreis = parseNumber(kaufpreisRaw);
    const anzahl = parseNumber(anzahlRaw);
    let gesamtpreis = parseNumber(gesamtpreisRaw);

    if (!ticker || !kaufpreisRaw || !anzahlRaw) {
      errors.push(
        `Zeile ${rowNr}: Ticker, Kaufpreis oder Anzahl sind leer.`
      );
      return;
    }

    if (Number.isNaN(kaufpreis)) {
      errors.push(
        `Zeile ${rowNr}: Kaufpreis '${kaufpreisRaw}' ist keine gültige Zahl.`
      );
      return;
    }

    if (Number.isNaN(anzahl)) {
      errors.push(
        `Zeile ${rowNr}: Anzahl '${anzahlRaw}' ist keine gültige Zahl.`
      );
      return;
    }

    if (!kaufdatum) {
      errors.push(`Zeile ${rowNr}: Kaufdatum ist leer.`);
      return;
    }

    // Gesamtpreis: CSV-Wert verwenden, wenn gültig, sonst berechnen
    if (Number.isNaN(gesamtpreis)) {
      gesamtpreis = kaufpreis * anzahl;
    }

    validRows.push({
      Ticker: ticker,
      Kaufpreis: kaufpreis,
      Anzahl: anzahl,
      Kaufdatum: kaufdatum,
      Gesamtpreis: gesamtpreis,
    });
  });

  return { errors, validRows };
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

  // Analyse-Button (bestehende Logik)
  const handleAnalyze = () => {
    if (data.length === 0) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      showToast("Analyse erfolgreich. Kennzahlen aktualisiert.");
    }, 2000);
  };

  // Datei-Upload + Validierung + Speichern
  const processFile = (file) => {
    if (!file || !file.name) return;

    if (!file.name.endsWith(".csv")) {
      setError("Bitte eine gültige CSV-Datei hochladen.");
      setData([]);
      clearPortfolioData();
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSV(text);

        const { errors, validRows } = validateAndTransformCSV(parsed);

        if (errors.length > 0 || validRows.length === 0) {
          setError(errors);
          setData([]);
          clearPortfolioData();
          return;
        }

        setError("");
        updatePortfolioData(validRows);
        setData(validRows);
        setColumns(Object.keys(validRows[0]));
        setUploaded(true);

        try {
          const volumePath = await uploadCsvToVolume(file);
          showToast(`CSV gespeichert unter: ${volumePath}`);
        } catch (err) {
          console.error("Fehler beim Speichern in Databricks:", err);
          showToast("Fehler beim Speichern in Databricks.");
        }
      } catch (err) {
        console.error("Fehler beim Verarbeiten/Hochladen:", err);
        setError("Fehler beim Verarbeiten der CSV-Datei.");
        setData([]);
        clearPortfolioData();
      }
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

  // Bestehende Logik: neue Datei / neues Portfolio hochladen
  const handleReplaceFile = () => {
    setUploaded(false);
    setData([]);
    setError("");
    clearPortfolioData();
  };

  return (
    <div>
      <h3 className="upload-title">CSV-Upload</h3>

      {(!uploaded || error) ? (
        <div
          className={`upload-dropzone ${isDragging ? "drag-active" : ""}`}
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              fileInputRef.current
            ) {
              fileInputRef.current.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">+</div>
          <p className="upload-text">
            Datei hochladen bzw. hierher ziehen
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="upload-input"
            onChange={(e) => processFile(e.target.files[0])}
          />
        </div>
      ) : (
        !error &&
        data.length > 0 && (
          <div className="mt-4">
            <span className="upload-badge">
              Datei erfolgreich hochgeladen – {data.length} Zeilen verarbeitet
            </span>

            <table className="csv-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>
                        {(col === "Kaufpreis" || col === "Gesamtpreis")
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
        <div className="mt-4">
          <div className="error-badge">
            {Array.isArray(error) ? error.join(", ") : error}
          </div>

          <button
            className="replace-csv-btn"
            onClick={handleReplaceFile}
          >
            Neue Datei wählen
          </button>
        </div>
      )}

      <div className="analyze-section">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || data.length === 0 || error}
          className={`analyze-button ${isAnalyzing || data.length === 0 || error
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

