import React, { useState } from "react";
import { useData } from "../context/DataContext";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

const PortfolioChart = () => {
    const { portfolioData } = useData();
    // Hinweis: portfolioData wird hier aktuell noch nicht benutzt.
    // Später kannst du es je nach activeChart für echte Auswertungen verwenden.

    // -------------------------------------------------------------
    // State: Welcher Chart soll aktuell angezeigt werden?
    // Mögliche Werte: "riskReturn", "verlauf", "rolling"
    // -------------------------------------------------------------
    const [activeChart, setActiveChart] = useState("riskReturn");

    // -------------------------------------------------------------
    // Demo-Daten für die drei verschiedenen Chart-Typen
    // (Platzhalter – später durch echte Daten ersetzen)
    // -------------------------------------------------------------
    const demoRiskReturnData = [
        { name: "Jan", value: 8 },
        { name: "Feb", value: 10 },
        { name: "Mär", value: 7 },
        { name: "Apr", value: 11 },
        { name: "Mai", value: 9 },
    ];

    const demoVerlaufData = [
        { name: "Jan", value: 100 },
        { name: "Feb", value: 120 },
        { name: "Mär", value: 90 },
        { name: "Apr", value: 130 },
        { name: "Mai", value: 150 },
    ];

    const demoRollingData = [
        { name: "Jan", value: 20 },
        { name: "Feb", value: 18 },
        { name: "Mär", value: 25 },
        { name: "Apr", value: 22 },
        { name: "Mai", value: 19 },
    ];

    // -------------------------------------------------------------
    // Hilfsfunktion: Bestimmen, welche Daten und welcher Titel
    // für den aktuell aktiven Chart verwendet werden sollen.
    // -------------------------------------------------------------
    const getActiveChartConfig = () => {
        switch (activeChart) {
            case "riskReturn":
                return {
                    title: "Risk-Return-Scatterplot",
                    data: demoRiskReturnData,
                };
            case "verlauf":
                return {
                    title: "Portfolio Verlauf",
                    data: demoVerlaufData,
                };
            case "rolling":
                return {
                    title: "Rolling Volatility",
                    data: demoRollingData,
                };
            default:
                return {
                    title: "Risk-Return-Scatterplot",
                    data: demoRiskReturnData,
                };
        }
    };

    const { title, data } = getActiveChartConfig();

    return (
        <div className="chart-wrapper">
            {/* ---------------------------------------------
          Tab-Leiste: Auswahl, welcher Chart angezeigt wird
         ---------------------------------------------- */}
            <div className="chart-tab-row">
                <button
                    type="button"
                    className={
                        activeChart === "riskReturn"
                            ? "chart-tab chart-tab-active"
                            : "chart-tab"
                    }
                    onClick={() => setActiveChart("riskReturn")}
                >
                    Risk-Return-Scatterplot
                </button>

                <button
                    type="button"
                    className={
                        activeChart === "verlauf"
                            ? "chart-tab chart-tab-active"
                            : "chart-tab"
                    }
                    onClick={() => setActiveChart("verlauf")}
                >
                    Portfolio Verlauf
                </button>

                <button
                    type="button"
                    className={
                        activeChart === "rolling"
                            ? "chart-tab chart-tab-active"
                            : "chart-tab"
                    }
                    onClick={() => setActiveChart("rolling")}
                >
                    Rolling Volatility
                </button>
            </div>

            {/* ---------------------------------------------
          Aktuell ausgewählter Chart (immer nur EINER)
         ---------------------------------------------- */}
            <div className="single-chart-container">
                <div className="chart-title-row">
                    <h3 className="chart-section-title">{title}</h3>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
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

export default PortfolioChart;
