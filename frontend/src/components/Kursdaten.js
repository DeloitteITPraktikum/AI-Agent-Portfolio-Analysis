// src/components/Kursdaten/Kursdaten.js
import React, { useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

// Demo-Daten für Kursverlauf (Platzhalter)
// Später kannst du hier echte Kursdaten aus dem Backend verwenden.
const demoPriceData = [
    { date: "Jan", price: 100 },
    { date: "Feb", price: 105 },
    { date: "Mär", price: 98 },
    { date: "Apr", price: 112 },
    { date: "Mai", price: 120 },
];

const Kursdaten = () => {
    // -------------------------------------------------------------
    // State für Ticker und Zeitraum (noch ohne Logik/Backend)
    // -------------------------------------------------------------
    const [ticker, setTicker] = useState("");
    const [period, setPeriod] = useState("1Y");

    return (
        <div className="chart-wrapper">
            {/* Seitentitel */}


            {/* -------------------------------------------------
          Steuerungsleiste über dem Chart:
          - Ticker-Eingabe (mit Dropdown-Vorschlägen)
          - Zeitraum-Auswahl
         ------------------------------------------------- */}
            <div className="kursdaten-controls-row">
                {/* Ticker-Auswahl */}
                <div className="kursdaten-control">
                    <span className="kursdaten-label">Ticker</span>
                    {/* Input mit datalist: man kann tippen ODER aus Dropdown wählen */}
                    <input
                        type="text"
                        className="kursdaten-input"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        list="ticker-options"
                        placeholder="z. B. SPY"
                    />
                    <datalist id="ticker-options">
                        <option value="SPY" />
                        <option value="AAPL" />
                        <option value="MSFT" />
                        <option value="DAX" />
                        <option value="SXR8" />
                    </datalist>
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
            </div>

            {/* -------------------------------------------------
          Chart-Container (bleibt wie bisher darunter)
         ------------------------------------------------- */}
            <div className="single-chart-container">


                <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                        data={demoPriceData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* X-Achse: Zeit */}
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            label={{
                                value: "Zeit",
                                position: "bottom",
                                offset: 20,
                                style: { fontSize: 11 },
                            }}
                        />

                        {/* Y-Achse: Kursniveau */}
                        <YAxis
                            tick={{ fontSize: 12 }}
                            label={{
                                value: "Kurs (Indexwert)",
                                angle: -90,
                                position: "insideLeft",
                                dy: -40,
                                style: { fontSize: 13, fontWeight: 500 },
                            }}
                        />

                        <Tooltip />

                        <Line
                            name="Portfolio-Kurs"
                            type="monotone"
                            dataKey="price"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Kursdaten;
