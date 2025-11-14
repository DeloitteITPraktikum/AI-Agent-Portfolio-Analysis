// src/components/CsvUpload.js
import React, { useState } from "react";

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

  // Prüfung der CSV auf Pflichtspalten und leere Felder
  const validateCSV = (parsedData) => {
    const expected = ["Ticker", "Anzahl", "Kaufpreis"];
    const headers = Object.keys(parsedData[0] || {});
    const missing = expected.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
      return `Fehlende Spalten: ${missing.join(", ")}`;
    }

    for (let row of parsedData) {
      if (!row.Ticker || !row.Anzahl || !row.Kaufpreis) {
        return "Einige Zeilen enthalten leere Felder.";
      }
      if (isNaN(Number(row.Anzahl)) || isNaN(Number(row.Kaufpreis))) {
        return "Spalten 'Anzahl' und 'Kaufpreis' müssen Zahlen enthalten.";
      }
    }

    return "";
  };

  // Wird aufgerufen, wenn eine CSV-Datei hochgeladen wird
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Bitte eine gültige CSV-Datei hochladen.");
      setData([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);

      const validationError = validateCSV(parsed);
      if (validationError) {
        setError(validationError);
        setData([]);
      } else {
        setError("");
        setData(parsed);
        setColumns(Object.keys(parsed[0]));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-3">📄 CSV-Upload (lokale Überprüfung)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-3"
      />

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!error && data.length > 0 && (
        <div>
          <p className="text-green-700 font-semibold">
            ✅ Datei erfolgreich geprüft ({data.length} Zeilen)
          </p>

          <table className="mt-4 border border-gray-300 w-full text-sm">
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
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs mt-1 text-gray-500">
            (Nur die ersten 5 Zeilen werden angezeigt)
          </p>
        </div>
      )}
    </div>
  );
};

export default CsvUpload;
