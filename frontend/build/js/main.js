// main.js
console.log("Dashboard gestartet");

// Initialisierung für den CSV-Upload
function initCsvUpload() {
  const fileInput = document.getElementById("csv-input");
  const button = document.getElementById("csv-button");
  const status = document.getElementById("upload-status");

  if (!fileInput || !button || !status) {
    console.warn("CSV-Upload-Elemente nicht gefunden");
    return;
  }

  // Klick auf den grünen Button öffnet das versteckte File-Input
  button.addEventListener("click", () => {
    fileInput.click();
  });

  // Wenn eine Datei ausgewählt wurde
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    status.textContent = `Lade Datei: ${file.name} …`;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      status.textContent = `Datei geladen: ${file.name} (${text.length} Zeichen)`;

      // Demo: erste 5 Zeilen in der Konsole ausgeben
      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
      console.log("Erste Zeilen der CSV:", lines.slice(0, 5));
    };

    reader.onerror = () => {
      status.textContent = "Fehler beim Lesen der Datei.";
      console.error("Fehler beim Lesen der CSV-Datei");
    };

    reader.readAsText(file, "UTF-8");
  });
}

// Script steht am Ende von <body>, DOM ist schon da
initCsvUpload();
