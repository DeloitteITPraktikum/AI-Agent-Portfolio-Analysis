import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/darkmode.css";
import ToastContext from "./ToastContext";
import { DataProvider } from "./context/DataContext";
import KIAgentPage from "./pages/KIAgentPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import CsvUpload from "./components/CsvUpload";
import { useEffect, useState } from "react";
import KursdatenPage from "./pages/KursdatenPage";
import { translations } from "./utils/translations";

// Tooltip-Komponente importieren
import InfoTooltip from "./components/InfoToolTip";

const ROLLING_CONFIG = {
  daily: { key: "daily", label: "Täglich", unitLabel: "Tage", min: 20, standard: 60, daysPerUnit: 1 },
  weekly: { key: "weekly", label: "Wöchentlich", unitLabel: "Wochen", min: 8, standard: 12, daysPerUnit: 7 },
  monthly: { key: "monthly", label: "Monatlich", unitLabel: "Monate", min: 6, standard: 12, daysPerUnit: 30 },
};

const ROLLING_PRESETS = {
  short: { key: "short", label: "Kurzfristig", frequency: "daily", window: 20 },
  mid: { key: "mid", label: "Mittelfristig", frequency: "weekly", window: 12 },
  long: { key: "long", label: "Langfristig", frequency: "monthly", window: 12 },
};

function App() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Theme State
  const [theme, setTheme] = useState("light");

  // Language State
  const [language, setLanguage] = useState("de");

  // Translation Helper
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  useEffect(() => {
    // Apply dark mode class to body based on state
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
      document.body.classList.remove('dark-mode');
    } else {
      // Auto/System preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }, [theme]);

  const [chartBenchmark, setChartBenchmark] = useState("sp500");
  const [chartFrequency, setChartFrequency] = useState("daily");
  const [chartCurrency, setChartCurrency] = useState("usd");
  const [chartIndexType, setChartIndexType] = useState("tri");
  const [chartRiskFree, setChartRiskFree] = useState("3m_tbill");
  const [chartStartDate, setChartStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [settingsChanged, setSettingsChanged] = useState(false);

  const [rollingWindow, setRollingWindow] = useState(ROLLING_CONFIG.daily.standard);
  const [rollingError, setRollingError] = useState("");
  const [frwMode, setFrwMode] = useState("free");
  const [selectedPreset, setSelectedPreset] = useState("short");
  const [agentInput, setAgentInput] = useState("");

  const parseLocalDate = (value) => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const validateDateRange = (s, e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = s ? parseLocalDate(s) : null;
    const end = e ? parseLocalDate(e) : null;

    if (start && start > today) return setDateError("Das Startdatum darf nicht in der Zukunft liegen.");
    if (end && end > today) return setDateError("Das Enddatum darf nicht in der Zukunft liegen.");
    if (start && end && end <= start) return setDateError("Das Enddatum muss nach dem Startdatum liegen.");

    setDateError("");
  };

  const handleFrequencyChange = (value) => {
    const cfg = ROLLING_CONFIG[value];
    setChartFrequency(value);
    setRollingWindow((prev) => Math.max(Number(prev) || 0, cfg.min));
    setRollingError("");
  };

  const handleRollingChange = (e) => {
    const raw = e.target.value;
    const num = Number(raw);
    const cfg = ROLLING_CONFIG[chartFrequency];

    if (raw === "") return setRollingWindow("");

    if (isNaN(num)) {
      setRollingWindow(raw);
      return setRollingError("Bitte eine gültige Zahl eingeben.");
    }
    if (num < cfg.min) {
      setRollingWindow(num);
      return setRollingError(`Rolling Window muss mindestens ${cfg.min} ${cfg.unitLabel} betragen (bei ${cfg.label}).`);
    }

    setRollingWindow(num);
    setRollingError("");
  };

  const handleApplyChartSettings = () => {
    if (rollingError || dateError) return;
    setSettingsChanged(false);
  };

  const handlePresetApply = (key) => {
    const p = ROLLING_PRESETS[key];
    setFrwMode("preset");
    setSelectedPreset(key);
    handleFrequencyChange(p.frequency);
    setRollingWindow(p.window);
    setRollingError("");
  };

  useEffect(() => {
    if (!chartStartDate || !chartEndDate) return;
    const start = new Date(chartStartDate);
    const end = new Date(chartEndDate);
    if (isNaN(start) || isNaN(end) || end <= start) return;

    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    const cfg = ROLLING_CONFIG[chartFrequency];
    const maxUnits = Math.floor(diffDays / cfg.daysPerUnit);
    if (maxUnits <= 0) return;

    setRollingWindow((prev) => {
      const num = Number(prev) || 0;
      if (num > maxUnits) return maxUnits;
      return num;
    });
  }, [chartStartDate, chartEndDate, chartFrequency]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => {
    const sidebar = document.createElement("script");
    sidebar.src = process.env.PUBLIC_URL + "/js/sidebar.js";
    document.body.appendChild(sidebar);

    const main = document.createElement("script");
    main.src = process.env.PUBLIC_URL + "/js/main.js";
    document.body.appendChild(main);
  }, []);

  const [activePage, setActivePage] = useState("dashboard");

  return (
    <DataProvider>
      <ToastContext.Provider value={{ showToast }}>
        <div className="app">
          <div className={`toast-container ${toastVisible ? "show" : ""}`}>{toastMessage}</div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="logo">
              <img src={process.env.PUBLIC_URL + "/img/delovest-logo.png"} alt="DeloVest Logo" className="logo-img" />
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">
                <button
                  className={"nav-header nav-header-single " + (activePage === "dashboard" ? "active" : "")}
                  onClick={() => setActivePage("dashboard")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src={process.env.PUBLIC_URL + "/img/icons/dashboard.png"} alt="" />
                    </span>
                    <span className="nav-label">{t('sidebar.dashboard')}</span>
                  </span>
                </button>
              </div>

              <div className="nav-section">
                <button
                  className={"nav-header nav-header-single " + (activePage === "agent" ? "active" : "")}
                  onClick={() => setActivePage("agent")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src={process.env.PUBLIC_URL + "/img/icons/agent.png"} alt="" />
                    </span>
                    <span className="nav-label">{t('sidebar.agent')}</span>
                  </span>
                </button>
              </div>

              <div className="nav-section">
                <button
                  className={"nav-header nav-header-single " + (activePage === "kursdaten" ? "active" : "")}
                  onClick={() => setActivePage("kursdaten")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src={process.env.PUBLIC_URL + "/img/icons/analytics.png"} alt="" />
                    </span>
                    <span className="nav-label">{t('sidebar.kursdaten')}</span>
                  </span>
                </button>
              </div>

              <div className="nav-section">
                <button
                  className={"nav-header nav-header-single " + (activePage === "reports" ? "active" : "")}
                  onClick={() => setActivePage("reports")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src={process.env.PUBLIC_URL + "/img/icons/reports.png"} alt="" />
                    </span>
                    <span className="nav-label">{t('sidebar.reports')}</span>
                  </span>
                </button>
              </div>

              <div className="nav-section">
                <button
                  className={"nav-header nav-header-single " + (activePage === "settings" ? "active" : "")}
                  onClick={() => setActivePage("settings")}
                >
                  <span className="nav-left">
                    <span className="nav-icon">
                      <img src={process.env.PUBLIC_URL + "/img/icons/settings.png"} alt="" />
                    </span>
                    <span className="nav-label">{t('sidebar.settings')}</span>
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
                  <h1>{t('dashboard.title')}</h1>
                  <p className="main-subtitle">{t('dashboard.subtitle')}</p>
                </header>

                <div className="card upload-card">
                  <CsvUpload />
                </div>

                <div className="kpi-row">
                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip label={<span className="kpi-label-text">{t('dashboard.kpiRendite')}</span>} text="Rendite: Verhältnis..." />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip label={<span className="kpi-label-text">{t('dashboard.kpiVola')}</span>} text="Volatilität: Maß..." />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip label={<span className="kpi-label-text">{t('dashboard.kpiStdDev')}</span>} text="Standardabweichung..." />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>

                  <div className="kpi-divider"></div>

                  <div className="kpi-item">
                    <span className="kpi-label">
                      <InfoTooltip label={<span className="kpi-label-text">{t('dashboard.kpiRiskFree')}</span>} text="Risikofreie Rendite..." />
                    </span>
                    <span className="kpi-value"> -- </span>
                  </div>
                </div>


                {/* Dashboard Grid - Empty for now, Charts removed per request */}
                <section className="dashboard-grid">
                  {/* ... */}
                </section>

                {/* Floating AI Command Bar */}
                <div className="ai-command-bar-container">
                  <div className="ai-command-bar">
                    <input
                      type="text"
                      className="ai-command-input"
                      placeholder={t('dashboard.aiInputPlaceholder') || "Fragen Sie Ihren KI-Analysten..."}
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setActivePage("agent");
                        }
                      }}
                      autoFocus
                    />
                    <button
                      className="btn-ai-command"
                      onClick={() => setActivePage("agent")}
                      title="KI Agent öffnen"
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/img/icons/agent.png"}
                        alt="AI"
                        style={{ width: '22px', height: '22px' }}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* KEEP ALIVE: Agent Page is always mounted but hidden via CSS */}
            <div style={{ display: activePage === "agent" ? 'block' : 'none' }}>
              <KIAgentPage initialInput={agentInput} />
            </div>

            {activePage === "kursdaten" && <KursdatenPage />}
            {activePage === "reports" && <ReportsPage />}
            {activePage === "settings" && (
              <SettingsPage
                currentTheme={theme}
                onThemeChange={setTheme}
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            )}
          </main>
        </div>
      </ToastContext.Provider>
    </DataProvider>
  );
}

export default App;