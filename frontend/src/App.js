import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import ToastContext from "./ToastContext";
import { DataProvider } from "./context/DataContext";
import KIAgentPage from "./pages/KIAgentPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import CsvUpload from "./components/CsvUpload";
import { useEffect, useState } from "react";
import PortfolioChart from "./components/PortfolioChart";
import KursdatenPage from "./pages/KursdatenPage";



// Tooltip-Komponente importieren
import InfoTooltip from "./components/InfoToolTip";


// Konfiguration für Frequenz & Rolling Window
const ROLLING_CONFIG = {
  daily: {
    key: "daily",
    label: "Täglich",
    unitLabel: "Tage",
    min: 20,          // Mindestlänge bei täglicher Frequenz
    standard: 60,     // Standardwert
    daysPerUnit: 1,   // 1 Tag pro Einheit
  },
  weekly: {
    key: "weekly",
    label: "Wöchentlich",
    unitLabel: "Wochen",
    min: 8,           // Mindestlänge bei wöchentlicher Frequenz
    standard: 12,
    daysPerUnit: 7,   // ca. 7 Tage pro Einheit
  },
  monthly: {
    key: "monthly",
    label: "Monatlich",
    unitLabel: "Monate",
    min: 6,           // Mindestlänge bei monatlicher Frequenz
    standard: 12,
    daysPerUnit: 30,  // grobe Approximation
  },
};
// Vordefinierte Kombinationen für Frequenz & Rolling Window
const ROLLING_PRESETS = {
  short: {
    key: "short",
    label: "Kurzfristig",
    frequency: "daily",
    window: 20, // 20 Tage
  },
  mid: {
    key: "mid",
    label: "Mittelfristig",
    frequency: "weekly",
    window: 12, // 12 Wochen
  },
  long: {
    key: "long",
    label: "Langfristig",
    frequency: "monthly",
    window: 12, // 12 Monate
  },
};





function App() {
  // ---------------- Toast Logik ----------------
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // ---- Chart-Filter für Portfolio-Chart ----
  const [chartBenchmark, setChartBenchmark] = useState("sp500");
  const [chartFrequency, setChartFrequency] = useState("daily");
  const [chartCurrency, setChartCurrency] = useState("usd");
  const [chartIndexType, setChartIndexType] = useState("tri");
  const [chartRiskFree, setChartRiskFree] = useState("3m_tbill");
  const [chartStartDate, setChartStartDate] = useState(""); // Startdatum des Betrachtungszeitraums
  const [chartEndDate, setChartEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [settingsChanged, setSettingsChanged] = useState(false);


  // Rolling-Window-Logik
  const [rollingWindow, setRollingWindow] = useState(
    ROLLING_CONFIG.daily.standard
  );
  const [rollingError, setRollingError] = useState("");
  // Modus für Frequenz & Rolling Window: "free" (frei wählbar) oder "preset"
  const [frwMode, setFrwMode] = useState("free");
  const [selectedPreset, setSelectedPreset] = useState("short");

  // ------------------------------------------

  // ---- Validierung für Start- und Enddatum (kein Datum in der Zukunft, Enddatum nach Startdatum) ----


  // -------------------------------------------------------------
  const parseLocalDate = (value) => {
    if (!value) return null;

    // Browser gibt yyyy-mm-dd zurück → manuell in lokales Datum umwandeln
    const [year, month, day] = value.split("-").map(Number);

    // Monat -1 weil JS Monate 0–11 sind
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const validateDateRange = (startValue, endValue) => {
    // Heutiges lokales Datum erstellen (Mitternacht)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Eingabedaten korrekt als lokales Datum parsen
    const start = startValue ? parseLocalDate(startValue) : null;
    const end = endValue ? parseLocalDate(endValue) : null;

    // Startdatum nicht in der Zukunft
    if (start && start > today) {
      setDateError("Das Startdatum darf nicht in der Zukunft liegen.");
      return;
    }

    // Enddatum nicht in der Zukunft
    if (end && end > today) {
      setDateError("Das Enddatum darf nicht in der Zukunft liegen.");
      return;
    }

    // Enddatum muss nach dem Startdatum liegen
    if (start && end && end <= start) {
      setDateError("Das Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    // Alles OK
    setDateError("");
  };

  // ---- Handler für Frequenzwechsel (passt Rolling Window an Mindestwert an) ----
  const handleFrequencyChange = (value) => {
    const cfg = ROLLING_CONFIG[value];

    setChartFrequency(value);

    setRollingWindow((prev) => {
      const numeric = Number(prev) || 0;
      // Wenn der bisherige Wert kleiner als das neue Minimum ist,
      // wird automatisch auf das Minimum der neuen Frequenz gesetzt.
      return Math.max(numeric, cfg.min);
    });

    // Fehler-Text zurücksetzen beim Wechsel der Frequenz
    setRollingError("");
  };

  // ---- Handler für Eingabe des Rolling Windows ----
  const handleRollingChange = (e) => {
    const raw = e.target.value;
    const value = Number(raw);
    const cfg = ROLLING_CONFIG[chartFrequency];

    // Leere Eingabe erlauben (z.B. während der Eingabe)
    if (raw === "") {
      setRollingWindow("");
      setRollingError("");
      return;
    }

    if (Number.isNaN(value)) {
      setRollingWindow(raw);
      setRollingError("Bitte eine gültige Zahl eingeben.");
      return;
    }

    // Mindestwert-Prüfung (nur, wenn der betrachtete Zeitraum lang genug ist – s. useEffect unten)
    if (value < cfg.min) {
      setRollingWindow(value);
      setRollingError(
        `Rolling Window muss mindestens ${cfg.min} ${cfg.unitLabel} betragen (bei ${cfg.label}).`
      );
    } else {
      setRollingWindow(value);
      setRollingError("");
    }
  };
  const handleApplyChartSettings = () => {
    if (rollingError || dateError) return;

    setSettingsChanged(false);

    // Zukunft: Chart hier neu berechnen
  };



  // ---- Anwenden einer vordefinierten Kombination (Preset) ----
  const handlePresetApply = (presetKey) => {
    const preset = ROLLING_PRESETS[presetKey];
    if (!preset) return;

    setFrwMode("preset");
    setSelectedPreset(presetKey);

    // Frequenz umschalten (inkl. Mindestwert-Logik)
    handleFrequencyChange(preset.frequency);

    // Rolling Window auf den vordefinierten Wert setzen
    setRollingWindow(preset.window);
    setRollingError("");
  };


  // ---- Automatische Anpassung des Rolling Windows an den gewählten Zeitraum ----
  useEffect(() => {
    if (!chartStartDate || !chartEndDate) return;

    const start = new Date(chartStartDate);
    const end = new Date(chartEndDate);

    if (isNaN(start) || isNaN(end) || end <= start) return;

    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const cfg = ROLLING_CONFIG[chartFrequency];

    // Maximale Anzahl an Einheiten (Tage/Wochen/Monate) im gewählten Zeitraum
    const maxUnits = Math.floor(diffDays / cfg.daysPerUnit);

    if (maxUnits <= 0) return;

    // Falls der Nutzer ein Rolling Window wählt, das länger ist als der Zeitraum,
    // wird es automatisch auf die maximal mögliche Länge reduziert.
    setRollingWindow((prev) => {
      const numeric = Number(prev) || 0;

      if (numeric > maxUnits) {
        // Hier NICHT den Mindestwert erzwingen – Vorgabe aus der Spezifikation:
        // Wenn Zeitraum kürzer als gewünschtes Rolling Window ist,
        // wird auf die maximal mögliche Länge verkürzt (auch wenn < Mindestwert).
        setRollingError("");
        return maxUnits;
      }

      // Wenn der Zeitraum kürzer ist als das konfigurierte Minimum,
      // darf der Nutzer trotzdem ein kleineres Window verwenden -> keinen Fehler anzeigen.
      if (maxUnits < cfg.min && numeric === maxUnits) {
        setRollingError("");
      }

      return numeric;
    });
  }, [chartStartDate, chartEndDate, chartFrequency]);


  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);

    setTimeout(() => setToastVisible(false), 3000);
  };
  // --------------------------------------------

  useEffect(() => {
    // Sidebar & Main Scripts (Dropdowns etc.)
    const sidebarScript = document.createElement("script");
    sidebarScript.src = "/js/sidebar.js";
    document.body.appendChild(sidebarScript);

    const mainScript = document.createElement("script");
    mainScript.src = "/js/main.js";
    document.body.appendChild(mainScript);
  }, []);

  const [activePage, setActivePage] = useState("dashboard");

  return (
    <DataProvider>
      <ToastContext.Provider value={{ showToast }}>
        <div className="app">
          {/* ---------------- Toast UI oben rechts ---------------- */}
          <div className={`toast-container ${toastVisible ? "show" : ""}`}>
            {toastMessage}
          </div>
          {/* ------------------------------------------------------ */}

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="logo">
              <img
                src="/img/delovest-logo.png"
                alt="DeloVest Logo"
                className="logo-img"
              />
            </div>

            <nav className="sidebar-nav">
              {/* Dashboard */}
              <div className="nav-section">
                <button
                  className={
                    "nav-header nav-header-single " +
                    (activePage === "dashboard" ? "active" : "")
                  }
                  id="nav-dashboard"
                  onClick={() => setActivePage("dashboard")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src="/img/icons/dashboard.png" alt="" />
                    </span>
                    <span className="nav-label">Dashboard</span>
                  </span>
                </button>
              </div>

              {/* KI Agent */}
              <div className="nav-section">
                <button
                  type="button"
                  className={
                    "nav-header nav-header-single " +
                    (activePage === "agent" ? "active" : "")
                  }
                  onClick={() => setActivePage("agent")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src="/img/icons/agent.png" alt="" />
                    </span>
                    <span className="nav-label">KI Agent</span>
                  </span>
                </button>
              </div>

              {/*Kursdaten*/}
              <div className="nav-section">
                <button
                  type="button"
                  className={
                    "nav-header nav-header-single " +
                    (activePage === "kursdaten" ? "active" : "")
                  }
                  onClick={() => setActivePage("kursdaten")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src="/img/icons/analytics.png" alt="" />
                    </span>
                    <span className="nav-label">Kursdaten</span>
                  </span>
                </button>
              </div>

              {/* Reports */}
              <div className="nav-section">
                <button
                  type="button"
                  className={
                    "nav-header nav-header-single " +
                    (activePage === "reports" ? "active" : "")
                  }
                  onClick={() => setActivePage("reports")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src="/img/icons/reports.png" alt="" />
                    </span>
                    <span className="nav-label">Reports &amp; Exports</span>
                  </span>
                </button>
              </div>




              {/* Einstellungen */}
              <div className="nav-section">
                <button
                  type="button"
                  className={
                    "nav-header nav-header-single " +
                    (activePage === "settings" ? "active" : "")
                  }
                  onClick={() => setActivePage("settings")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src="/img/icons/settings.png" alt="" />
                    </span>
                    <span className="nav-label">
                      Einstellungen &amp; Dokumentation
                    </span>
                  </span>
                </button>
              </div>
            </nav>
          </aside>


          {/* Hauptbereich */}
          <main className="main">
            {activePage === "dashboard" && (
              <>
                <header className="main-header">
                  <h1>Portfolio Dashboard</h1>
                  <p className="main-subtitle">
                    Überblick über Performance &amp; Risiko-Kennzahlen
                  </p>
                </header>

                {/* CSV Upload */}
                <div className="card upload-card">
                  <CsvUpload />
                </div>

                {/* ----------- KPI-Row mit Tooltips für Kennzahlen ------------ */}
                <div className="kpi-row">
                  {/* Rendite */}
                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip
                        label={<span className="kpi-label-text">Rendite</span>}
                        text="Rendite: Verhältnis zwischen Gewinn und eingesetztem Kapital über den betrachteten Zeitraum."
                      />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  {/* Volatilität */}
                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip
                        label={
                          <span className="kpi-label-text">Volatilität</span>
                        }
                        text="Volatilität: Maß für die Schwankungsintensität der Renditen; je höher, desto unsicherer die Entwicklung."
                      />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  {/* Standardabweichung */}
                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip
                        label={
                          <span className="kpi-label-text">
                            Standardabweichung
                          </span>
                        }
                        text="Standardabweichung: Statistisches Maß für die durchschnittliche Abweichung der Renditen vom Mittelwert."
                      />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  {/* Risikofreie Rendite */}
                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip
                        label={
                          <span className="kpi-label-text">
                            Risikofreie Rendite
                          </span>
                        }
                        text="Risikofreie Rendite: Referenzrendite einer als sicher geltenden Anlage z.B. kurzlaufende Staatsanleihen."
                      />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>
                </div>
                {/* ------------------------------------------------------------ */}


                {/* Dashboard-Grid */}
                <section className="dashboard-grid">

                  {/* Chart */}
                  <div className="card chart-card">
                    <h2>Portfolio-Chart</h2>

                    {/* Bedienfeld für die Chart-Einstellungen */}
                    <div className="chart-controls">

                      {/* Hauptlayout: Links = FRW + Datum, Rechts = 4 Dropdowns */}
                      <div className="chart-controls-main">

                        {/* ------------------------- LINKE SPALTE ------------------------- */}
                        <div className="chart-controls-left">

                          {/* Frequenz & Rolling Window */}
                          <div className="chart-control chart-control-frw">
                            <span className="chart-control-main-label">
                              Frequenz &amp; Rolling Window
                            </span>

                            {/* Umschalter: Frei wählbar / Empfohlene Kombinationen */}
                            <div className="chart-frw-mode-toggle">
                              <button
                                type="button"
                                className={
                                  "chart-frw-mode-btn" + (frwMode === "free" ? " is-active" : "")
                                }
                                onClick={() => setFrwMode("free")}
                              >
                                Frei wählbar
                              </button>
                              <button
                                type="button"
                                className={
                                  "chart-frw-mode-btn" + (frwMode === "preset" ? " is-active" : "")
                                }
                                onClick={() => setFrwMode("preset")}
                              >
                                Empfohlene Kombinationen
                              </button>
                            </div>

                            {/* Bereich unterhalb des Umschalters */}
                            <div className="chart-frw-body">
                              {frwMode === "free" ? (
                                /* Frei wählbare Einstellungen */
                                <div className="chart-frw-card">
                                  <div className="chart-frw-row">

                                    {/* Frequenz */}
                                    <div className="chart-frw-field">
                                      <label htmlFor="freq-select">Frequenz</label>
                                      <select
                                        id="freq-select"
                                        value={chartFrequency}
                                        onChange={(e) => {
                                          handleFrequencyChange(e.target.value);
                                          setSettingsChanged(true);
                                        }}

                                      >
                                        <option value="daily">Täglich (Standard)</option>
                                        <option value="weekly">Wöchentlich</option>
                                        <option value="monthly">Monatlich</option>
                                      </select>
                                    </div>

                                    {/* Rolling Window */}
                                    <div className="chart-frw-field">
                                      {(() => {
                                        const cfg = ROLLING_CONFIG[chartFrequency];
                                        return (
                                          <>
                                            <label htmlFor="rolling-input">
                                              Rolling Window ({cfg.unitLabel})
                                            </label>
                                            <input
                                              id="rolling-input"
                                              type="number"
                                              min="1"
                                              value={rollingWindow}
                                              onChange={(e) => {
                                                handleRollingChange(e);
                                                setSettingsChanged(true);
                                              }}

                                            />
                                            <small className="chart-hint">
                                              Mindestwert bei {cfg.label}: {cfg.min} {cfg.unitLabel}.
                                            </small>
                                          </>
                                        );
                                      })()}
                                    </div>

                                  </div>

                                  {/* Fehlermeldung */}
                                  {rollingError && (
                                    <div className="chart-error">{rollingError}</div>
                                  )}
                                </div>
                              ) : (
                                /* Empfohlene Kombinationen */
                                <div className="chart-frw-presets">
                                  {Object.values(ROLLING_PRESETS).map((preset) => {
                                    const cfg = ROLLING_CONFIG[preset.frequency];
                                    const isActive = selectedPreset === preset.key;

                                    return (
                                      <button
                                        key={preset.key}
                                        type="button"
                                        className={
                                          "chart-frw-preset-btn" + (isActive ? " is-active" : "")
                                        }
                                        onClick={() => { handlePresetApply(preset.key); setSettingsChanged(true); }}
                                      >
                                        <div className="chart-frw-preset-title">{preset.label}</div>
                                        <div className="chart-frw-preset-desc">
                                          {cfg.label} · {preset.window} {cfg.unitLabel}
                                        </div>
                                        <div className="chart-frw-preset-hint">
                                          {preset.description}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* DATUM (bleibt unter FRW) */}
                          <div className="chart-control">
                            {/* Hauptlabel für den Datumsbereich */}
                            <span className="chart-control-main-label">Datum</span>

                            {/* Zeile mit Start- und Enddatum */}
                            <div className="chart-date-row">

                              {/* Startdatum */}
                              <div className="chart-date-field">
                                <label htmlFor="chart-startdate">Startdatum</label>
                                <input
                                  id="chart-startdate"
                                  type="date"
                                  value={chartStartDate}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Startdatum speichern
                                    setChartStartDate(value);
                                    // Datumsbereich prüfen
                                    validateDateRange(value, chartEndDate);
                                    setSettingsChanged(true);
                                  }}
                                />
                              </div>

                              {/* Enddatum */}
                              <div className="chart-date-field">
                                <label htmlFor="chart-enddate">Enddatum</label>
                                <input
                                  id="chart-enddate"
                                  type="date"
                                  value={chartEndDate}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Enddatum speichern
                                    setChartEndDate(value);
                                    // Datumsbereich prüfen
                                    validateDateRange(chartStartDate, value);
                                  }}
                                />
                              </div>
                            </div>

                            {/* Fehlermeldung bei ungültigem Datum */}
                            {dateError && <div className="chart-error">{dateError}</div>}
                          </div>

                        </div>

                        {/* ------------------------- RECHTE SPALTE ------------------------- */}
                        <div className="chart-controls-right">

                          <div className="chart-control">
                            <label htmlFor="currency-select">Währung</label>
                            <select
                              id="currency-select"
                              value={chartCurrency}
                              onChange={(e) => {
                                setChartCurrency(e.target.value); // Währung aktualisieren
                                setSettingsChanged(true);
                              }}
                            >
                              <option value="usd">US-Dollar (USD) (Standard)</option>
                              <option value="eur">Euro (EUR)</option>
                            </select>
                          </div>

                          <div className="chart-control">
                            <label htmlFor="benchmark-select">Benchmark</label>
                            <select
                              id="benchmark-select"
                              value={chartBenchmark}
                              onChange={(e) => {
                                setChartBenchmark(e.target.value); // Benchmark aktualisieren
                                setSettingsChanged(true);          // Änderung merken
                              }}
                            >
                              <option value="sp500">S&amp;P 500 (Standard)</option>
                              <option value="msci_world">MSCI World</option>
                            </select>
                          </div>

                          <div className="chart-control">
                            <label htmlFor="index-type-select">Index-Typ</label>
                            <select
                              id="index-type-select"
                              value={chartIndexType}
                              onChange={(e) => {
                                setChartIndexType(e.target.value); // Index-Typ aktualisieren
                                setSettingsChanged(true);          //  Änderung merken
                              }}
                            >
                              <option value="tri">Total Return Index (Standard)</option>
                              <option value="price">Price Index</option>
                            </select>
                          </div>

                          <div className="chart-control">
                            <label htmlFor="riskfree-select">Risikofreie Rendite</label>
                            <select
                              id="riskfree-select"
                              value={chartRiskFree}
                              onChange={(e) => {
                                setChartRiskFree(e.target.value);
                                setSettingsChanged(true);
                              }}

                            >
                              <option value="3m_tbill">3M US T-Bill (Standard)</option>
                              <option value="1m_tbill">1M US T-Bill</option>
                              <option value="6m_tbill">6M US T-Bill</option>
                            </select>
                            <button
                              type="button"
                              onClick={handleApplyChartSettings}
                              disabled={!settingsChanged || rollingError || dateError}
                              className={
                                (!settingsChanged || rollingError || dateError)
                                  ? "button-disabled apply-button"
                                  : "button-active apply-button"
                              }
                            >
                              Übernehmen
                            </button>



                          </div>

                        </div>

                      </div>

                    </div>
                    <PortfolioChart />
                  </div>

                </section>
              </>
            )}




            {/* KI Agent Seite */}
            {activePage === "agent" && <KIAgentPage />}

            {activePage === "kursdaten" && <KursdatenPage />}

            {/* Reports Seite */}
            {activePage === "reports" && <ReportsPage />}

            {/* Settings Seite */}
            {activePage === "settings" && <SettingsPage />}



          </main >
        </div >
      </ToastContext.Provider >
    </DataProvider >
  );
}

export default App;
