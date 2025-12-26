// src/components/Kursdaten/Kursdaten.js
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Feste Auswahl an Tickern
const TICKER_OPTIONS = ["AAPL", "AMZN", "GOOG", "MSFT", "NVDA"];

const Kursdaten = () => {
  // Standard-Ticker: einer aus der Liste oben
  const [ticker, setTicker] = useState("AAPL");
  const [period, setPeriod] = useState("1M");

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // eigentliche Fetch-Funktion
  const fetchData = async (symbol) => {
    if (!symbol) {
      setError("Bitte einen Ticker auswählen.");
      setChartData([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/gold/ticker/${symbol}?limit=1000`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Fehler: ${res.status}`);
      }

      const json = await res.json();
      const rows = json.rows || [];

      // Zeitraum: sehr einfach über „letzte N Punkte“
      let filtered = rows;
      if (period !== "MAX") {
        const len = rows.length;
        let n = len;
        if (period === "1M") n = 22;
        if (period === "3M") n = 66;
        if (period === "6M") n = 132;
        if (period === "1Y") n = 260;
        if (period === "3Y") n = 780;
        filtered = rows.slice(Math.max(len - n, 0));
      }

      const mapped = filtered.map((r) => ({
        date: r.date,
        price: r.close,
      }));

      setChartData(mapped);
    } catch (e) {
      console.error("Fehler beim Laden der Kursdaten:", e);
      setError(e.message || "Fehler beim Laden der Kursdaten.");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadData = () => {
    fetchData(ticker);
  };

  // Beim ersten Rendern einmal für den Default-Ticker laden
  useEffect(() => {
    fetchData(ticker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="chart-wrapper">
      {/* Steuerungsleiste über dem Chart */}
      <div className="kursdaten-controls-row">
        {/* Ticker-Auswahl als Dropdown */}
        <div className="kursdaten-control">
          <span className="kursdaten-label">Ticker</span>
          <select
            className="kursdaten-select"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          >
            {TICKER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Zeitraum-Auswahl */}
        <div className="kursdaten-control">
          <span className="kursdaten-label">Zeitraum</span>
          <select
            className="kursdaten-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="1M">1 Monat</option>
            <option value="3M">3 Monate</option>
            <option value="6M">6 Monate</option>
            <option value="1Y">1 Jahr</option>
            <option value="3Y">3 Jahre</option>
            <option value="MAX">Max</option>
          </select>
        </div>

        {/* Button: Daten laden */}
        <div className="kursdaten-control">
          <span className="kursdaten-label">&nbsp;</span>
          <button
            className="analyze-button analyze-button-active"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Lade…" : "Daten laden"}
          </button>
        </div>
      </div>

      {/* Fehleranzeige */}
      {error && (
        <div className="csv-error" style={{ marginTop: "0.75rem" }}>
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Chart */}
      <div className="single-chart-container" style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        {loading && !chartData.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Lade Kursdaten…</div>
        ) : !loading && chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Keine Daten vorhanden.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                minTickGap={30}
              />

              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                itemStyle={{ color: '#86bc25' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />

              <Line
                name={ticker}
                type="monotone"
                dataKey="price"
                stroke="#86bc25"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#86bc25', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Kursdaten;