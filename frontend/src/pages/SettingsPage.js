import React, { useState } from 'react';

function SettingsPage() {
  const [settings, setSettings] = useState({
    // Allgemeine Einstellungen
    language: 'de',
    theme: 'auto'
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Einstellungen gespeichert:', settings);
    
    // Toast-Benachrichtigung anzeigen
    setShowSuccess(true);
    
    // Nach 5 Sekunden automatisch ausblenden
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleReset = () => {
    if (window.confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen?')) {
      setSettings({
        language: 'de',
        theme: 'auto',
        currency: 'EUR'
      });
      
      // Auch beim Zurücksetzen Toast-Benachrichtigung zeigen
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  };

  return (
    <section className="page-section">
      <header className="page-header">
        <h1>Einstellungen</h1>
      </header>

      {/* Toast-Benachrichtigung oben rechts */}
      <div className={`toast-container ${showSuccess ? 'show' : ''}`}>
        Einstellungen erfolgreich gespeichert
      </div>

      <div className="settings-grid">
        
        {/* Hilfe & Support - links */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Hilfe & Support</h2>
          </div>
          
          <div className="help-section">
            <h3 className="help-section-title">Dokumentation</h3>
            <div className="help-links">
              <button className="help-link">
                <div className="help-content">
                  <strong>Benutzerhandbuch</strong>
                  <small>Ausführliche Anleitung zur App-Nutzung</small>
                </div>
              </button>
              
              <button className="help-link">
                <div className="help-content">
                  <strong>Technische Dokumentation</strong>
                  <small>API-Referenz und Entwicklerinfos</small>
                </div>
              </button>
            </div>

            <h3 className="help-section-title">Support</h3>
            <div className="help-links">
              <button className="help-link">
                <div className="help-content">
                  <strong>Häufige Fragen</strong>
                  <small>Antworten auf häufige Probleme</small>
                </div>
              </button>
              
              <button className="help-link">
                <div className="help-content">
                  <strong>Problem melden</strong>
                  <small>Fehler oder technische Probleme</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rechte Spalte - Erscheinungsbild und Version */}
        <div className="settings-column">
          {/* Erscheinungsbild - oben rechts */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Erscheinungsbild</h2>
            </div>
            
            <div className="setting-item">
              <label>Sprache</label>
              <select 
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Design</label>
              <select 
                value={settings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="auto">System</option>
                <option value="light">Hell</option>
                <option value="dark">Dunkel</option>
              </select>
            </div>
          </div>

          {/* Versionsinformation - unter Erscheinungsbild */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Versionsinformation</h2>
            </div>
            
            <div className="version-info">
              <div className="version-item">
                <div className="version-label">Version</div>
                <div className="version-value">1.0.0</div>
              </div>
              <div className="version-item">
                <div className="version-label">Letztes Update</div>
                <div className="version-value">15. Dezember 2024</div>
              </div>
              <div className="version-item">
                <div className="version-label">Datenquellen</div>
                <div className="version-value">Alpha Vantage, SEC EDGAR</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Aktions-Buttons */}
      <div className="settings-actions">
        <button className="btn-secondary" onClick={handleReset}>
          Zurücksetzen
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Einstellungen speichern
        </button>
      </div>

    </section>
  );
}

export default SettingsPage;