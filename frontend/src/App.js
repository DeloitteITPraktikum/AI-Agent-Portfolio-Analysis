import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import CsvUpload from "./components/CsvUpload";

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Sidebar & Main Scripts (Dropdowns etc.)
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


          {/* KI Agent */}
          <div className="nav-section">
            <a href="/pages/agent.html" className="nav-header nav-header-single">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/agent.png" alt="" />
                </span>
                <span className="nav-label">KI Agent</span>
              </span>
            </a>
          </div>

          {/* Reports */}
          <div className="nav-section">
            <a href="/pages/reports.html" className="nav-header nav-header-single">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/reports.png" alt="" />
                </span>
                <span className="nav-label">Reports & Exports</span>
              </span>
            </a>
          </div>

          {/* Einstellungen */}
          <div className="nav-section">
            <a href="/pages/settings.html" className="nav-header nav-header-single">
              <span className="nav-left">
                <span className="nav-icon">
                  <img src="/img/icons/settings.png" alt="" />
                </span>
                <span className="nav-label">Einstellungen & Dokumentation</span>
              </span>
            </a>
          </div>

        </nav>
      </aside>

      {/* Hauptbereich (Dashboard bleibt wie vorher) */}
      <main className="main">

        <header className="main-header">
          <h1>Portfolio Dashboard</h1>
          <p className="main-subtitle">Überblick über Performance & Risiko-Kennzahlen</p>
        </header>

        <section className="dashboard-grid">

          {/* CSV Upload (React-Komponente) */}
          <div className="card upload-card">
              <CsvUpload /> </div>


          {/* Kennzahlen */}
          <div className="card stat-card"><h3>Rendite</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Volatilität</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Standardabweichung</h3><p className="stat-value">0 %</p></div>
          <div className="card stat-card"><h3>Risikofreie Rendite</h3><p className="stat-value">0 %</p></div>

          {/* Widget Slot */}
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

        </section>
      </main>
    </div>
  


    );
}

export default App;





