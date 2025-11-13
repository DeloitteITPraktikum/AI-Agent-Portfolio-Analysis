import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    // Deine bestehenden JS-Dateien laden (z. B. Sidebar-Logik)
    const sidebarScript = document.createElement('script');
    sidebarScript.src = '/js/sidebar.js';
    document.body.appendChild(sidebarScript);

    const mainScript = document.createElement('script');
    mainScript.src = '/js/main.js';
    document.body.appendChild(mainScript);
  }, []);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img src="/img/delovest-logo.png" alt="DeloVest Logo" className="logo-img" />
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <div className="nav-section">
            <button className="nav-header nav-header-single active" id="nav-dashboard">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/dashboard.png" alt="" />
                </span>
                <span className="nav-label">Dashboard</span>
              </span>
            </button>
          </div>

          {/* Portfolios */}
          <div className="nav-section">
            <button className="nav-header" data-target="portfolio-items">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/portfolios.png" alt="" />
                </span>
                <span className="nav-label">Portfolios</span>
              </span>
              <span className="nav-header-icon">▾</span>
            </button>
            <div className="nav-items" id="portfolio-items">
              <p>Portfolio-Übersicht</p>
              <p>CSV-Upload</p>
            </div>
          </div>

          {/* Kennzahlen & Analyse */}
          <div className="nav-section">
            <button className="nav-header" data-target="analytics-items">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/analytics.png" alt="" />
                </span>
                <span className="nav-label">Kennzahlen & Analyse</span>
              </span>
              <span className="nav-header-icon">▾</span>
            </button>
            <div className="nav-items" id="analytics-items">
              <p>Rendite</p>
              <p>Volatilität</p>
              <p>Standardabweichung</p>
              <p>Risikofreie Rendite</p>
              <p>Charts</p>
            </div>
          </div>

          {/* Daten & APIs */}
          <div className="nav-section">
            <button className="nav-header" data-target="data-items">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/data-apis.png" alt="" />
                </span>
                <span className="nav-label">Daten & APIs</span>
              </span>
              <span className="nav-header-icon">▾</span>
            </button>
            <div className="nav-items" id="data-items">
              <p>Datenquellen</p>
            </div>
          </div>

          {/* KI Agent */}
          <div className="nav-section">
            <button className="nav-header nav-header-single" id="nav-agent">
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
            <button className="nav-header nav-header-single" id="nav-reports">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/reports.png" alt="" />
                </span>
                <span className="nav-label">Reports & Exports</span>
              </span>
            </button>
          </div>

          {/* Einstellungen */}
          <div className="nav-section">
            <button className="nav-header nav-header-single" id="nav-settings">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/settings.png" alt="" />
                </span>
                <span className="nav-label">Einstellungen & Dokumentation</span>
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Hauptbereich */}
      <main className="main">
        <header className="main-header">
          <h1>Portfolio Dashboard</h1>
          <p className="main-subtitle">Überblick über Performance & Risiko-Kennzahlen</p>
        </header>

        <section className="dashboard-grid">
          {/* CSV Upload */}
          <div className="card upload-card">
            <h2>CSV-Upload</h2>
            <input type="file" id="csv-input" accept=".csv" className="file-input-hidden" />
            <button className="btn-upload" id="csv-button">Datei auswählen…</button>
            <p className="upload-status" id="upload-status">Noch keine Datei hochgeladen.</p>
          </div>

          {/* Kennzahlen */}
          <div className="card stat-card"><h3>Rendite</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Volatilität</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Standardabweichung</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Risikofreie Rendite</h3><p className="stat-value">0 %</p></div>

          {/* Widget */}
          <div className="card widget-slot">
            <div className="widget-plus">+</div>
            <p className="widget-text">Widget hinzufügen</p>
          </div>

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

          {/* Chat */}
          <div className="card chat-card">
            <h2>AI Analyst</h2>
            <textarea placeholder="Wie kann ich helfen?" className="chat-input"></textarea>
            <button className="btn-send">Senden</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

