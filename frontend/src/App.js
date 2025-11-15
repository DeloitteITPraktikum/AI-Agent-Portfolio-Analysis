import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import ToastContext from "./ToastContext";
import KIAgentPage from "./pages/KIAgentPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import CsvUpload from "./components/CsvUpload";
import { useEffect, useState } from "react";

function App() {
  // ---------------- Toast Logic ----------------
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);

    setTimeout(() => setToastVisible(false), 3000);
  };
  // ----------------------------------------------

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
    <ToastContext.Provider value={{ showToast }}>
      <div className="app">

        {/* ---------------- Toast UI oben rechts ---------------- */}
        <div className={`toast-container ${toastVisible ? "show" : ""}`}>
          {toastMessage}
        </div>
        {/* -------------------------------------------------------- */}

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
                  <span className="nav-label">Einstellungen &amp; Dokumentation</span>
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

              {/* ----------- KPI ROW (zentriert & modern) ------------ */}
              <div className="kpi-row">

                <div className="kpi-item">
                  <span className="kpi-label">Rendite</span>
                  <span className="kpi-value">0 %</span>
                </div>

                <div className="kpi-divider"></div>

                <div className="kpi-item">
                  <span className="kpi-label">Volatilität</span>
                  <span className="kpi-value">0 %</span>
                </div>

                <div className="kpi-divider"></div>

                <div className="kpi-item">
                  <span className="kpi-label">Standardabweichung</span>
                  <span className="kpi-value">0 %</span>
                </div>

                <div className="kpi-divider"></div>

                <div className="kpi-item">
                  <span className="kpi-label">Risikofreie Rendite</span>
                  <span className="kpi-value">0 %</span>
                </div>

              </div>
              {/* ------------------------------------------------------ */}

              <section className="dashboard-grid">

                {/* Chart */}
                <div className="card chart-card">
                  <h2>Portfolio-Chart</h2>
                  <div className="chart-placeholder">[Chart kommt später]</div>
                </div>

                {/* News */}
                <div className="card news-card">
                  <h2>Aktuelles aus der Finanzwelt</h2>
                  <p className="news-text">Aktuelles aus der Finanzwelt...</p>
                </div>

              </section>
            </>
          )}

          {activePage === "agent" && <KIAgentPage />}
          {activePage === "reports" && <ReportsPage />}
          {activePage === "settings" && <SettingsPage />}

        </main>
      </div>
    </ToastContext.Provider>
  );
}

export default App;
