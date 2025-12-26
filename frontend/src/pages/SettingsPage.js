import React, { useState } from 'react';
import { translations } from "../utils/translations";

function SettingsPage({ currentTheme, onThemeChange, currentLanguage, onLanguageChange }) {
  // Initialize local state with current Global state
  const [settings, setSettings] = useState({
    currency: 'EUR',
    theme: currentTheme || 'light',
    language: currentLanguage || 'de'
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Helper for local translations
  const t = (key) => {
    // translations use language from settings to preview changes immediately?
    // Or use global currentLanguage?
    // User expects to see the change potentially?
    // Usually UI language changes immediately or after save.
    // If we defer, the UI stays in old language until save. That's safer.
    // Let's stick to `currentLanguage` for translations so the UI doesn't switch mid-edit confusion.
    // OR: if user switches language, they might want to see it.
    // Let's use `currentLanguage` (global) to keep UI stable until "Save".
    const keys = key.split('.');
    let value = translations[currentLanguage || 'de'];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Apply changes to Global App State
    if (onThemeChange) onThemeChange(settings.theme);
    if (onLanguageChange) onLanguageChange(settings.language);

    console.log('Einstellungen gespeichert:', settings);

    // Toast-Benachrichtigung anzeigen
    setShowSuccess(true);

    // Nach 5 Sekunden automatisch ausblenden
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleReset = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      // Reset local state to defaults
      const defaults = {
        currency: 'EUR',
        theme: 'light',
        language: 'de'
      };
      setSettings(defaults);

      // Apply defaults immediately or wait for save?
      // "Reset" usually implies immediate action for "Restore Defaults".
      // Let's apply immediately for Reset button as it was before.
      if (onThemeChange) onThemeChange(defaults.theme);
      if (onLanguageChange) onLanguageChange(defaults.language);

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
        <h1>{t('settings.title')}</h1>
      </header>

      {/* Toast-Benachrichtigung oben rechts */}
      <div className={`toast-container ${showSuccess ? 'show' : ''}`}>
        {t('settings.successMessage')}
      </div>

      <div className="settings-grid">

        {/* Hilfe & Support - links */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>{t('settings.helpSupport')}</h2>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">{t('settings.documentation')}</h3>
            <div className="help-links">
              <button className="help-link">
                <div className="help-content">
                  <strong>{t('settings.userManual')}</strong>
                  <small>{t('settings.userManualDesc')}</small>
                </div>
              </button>

              <button className="help-link">
                <div className="help-content">
                  <strong>{t('settings.techDoc')}</strong>
                  <small>{t('settings.techDocDesc')}</small>
                </div>
              </button>
            </div>

            <h3 className="help-section-title">{t('settings.support')}</h3>
            <div className="help-links">
              <button className="help-link">
                <div className="help-content">
                  <strong>{t('settings.faq')}</strong>
                  <small>{t('settings.faqDesc')}</small>
                </div>
              </button>

              <button className="help-link">
                <div className="help-content">
                  <strong>{t('settings.reportIssue')}</strong>
                  <small>{t('settings.reportIssueDesc')}</small>
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
              <h2>{t('settings.appearance')}</h2>
            </div>

            <div className="setting-item">
              <label>{t('settings.language')}</label>
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
              <label>{t('settings.theme')}</label>
              <select
                value={settings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="auto">{t('settings.themeSystem')}</option>
                <option value="light">{t('settings.themeLight')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
              </select>
            </div>
          </div>

          {/* Versionsinformation - unter Erscheinungsbild */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>{t('settings.versionInfo')}</h2>
            </div>

            <div className="version-info">
              <div className="version-item">
                <div className="version-label">Version</div>
                <div className="version-value">1.0.0</div>
              </div>
              <div className="version-item">
                <div className="version-label">{t('settings.lastUpdate')}</div>
                <div className="version-value">
                  {new Date(2024, 11, 15).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : currentLanguage === 'fr' ? 'fr-FR' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="version-item">
                <div className="version-label">{t('settings.dataSources')}</div>
                <div className="version-value">Alpha Vantage, SEC EDGAR</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Aktions-Buttons */}
      <div className="settings-actions">
        <button className="btn-secondary" onClick={handleReset}>
          {t('settings.reset')}
        </button>
        <button className="btn-primary" onClick={handleSave}>
          {t('settings.save')}
        </button>
      </div>

    </section>
  );
}

export default SettingsPage;