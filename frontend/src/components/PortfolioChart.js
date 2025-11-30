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
    ScatterChart,
    Scatter,
    Legend,
    ReferenceLine,
} from "recharts";

const PortfolioChart = () => {
    const { portfolioData } = useData();

    // welcher Chart aktiv ist
    const [activeChart, setActiveChart] = useState("riskReturn");

    // -----------------------------
    // Demo-Daten für Risk-Return
    // -----------------------------
    const riskFreeRate = 0.02;

    const demoRiskReturnPortfolio = [{ vol: 0.10, ret: 0.13 }];
    const demoRiskReturnBenchmark = [{ vol: 0.05, ret: 0.06 }];

    // -----------------------------
    // Demo-Daten für Portfolio Verlauf (ZWEI Linien)
    // -----------------------------
    const demoVerlaufData = [
        { date: "Jan", portfolio: 0.10, benchmark: 0.06 },
        { date: "Feb", portfolio: 0.12, benchmark: 0.05 },
        { date: "Mär", portfolio: 0.09, benchmark: 0.07 },
        { date: "Apr", portfolio: 0.13, benchmark: 0.06 },
        { date: "Mai", portfolio: 0.15, benchmark: 0.08 },
    ];

    // -----------------------------
    // Demo-Daten für Rolling Vol
    // -----------------------------
    const demoRollingData = [
        { name: "Jan", value: 20 },
        { name: "Feb", value: 18 },
        { name: "Mär", value: 25 },
        { name: "Apr", value: 22 },
        { name: "Mai", value: 19 },
    ];

    const percentFormatter = (value) => `${(value * 100).toFixed(0)} %`;

    return (
        <div className="chart-wrapper">

            {/* Tabs OBEN */}
            <div className="chart-tab-row" style={{ marginBottom: "18px" }}>
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

            {/* -----------------------------
          1️⃣ Risk-Return Scatterplot
      ------------------------------ */}
            {activeChart === "riskReturn" && (
                <div className="single-chart-container">
                    <h3 className="chart-section-title">Risk-Return-Scatterplot</h3>

                    <ResponsiveContainer width="100%" height={260}>
                        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                type="number"
                                dataKey="vol"
                                domain={[0, 0.15]}
                                tickFormatter={percentFormatter}
                                name="Volatilität"
                                tick={{ fontSize: 12 }} // kleinere Ticks
                                label={{
                                    value: "Volatilität (%)",
                                    position: "insideRight",
                                    offset: 25,           // Abstand nach unten
                                    style: { fontSize: 11 },
                                }}
                            />


                            <YAxis
                                type="number"
                                dataKey="ret"
                                domain={[0, 0.15]}
                                tickFormatter={percentFormatter}
                                name="Rendite"
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Rendite (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -25,
                                    style: { fontSize: 11, fontWeight: 500 },
                                }}
                            />



                            <Tooltip formatter={(value) => percentFormatter(value)} />
                            <Legend />

                            <Scatter
                                name="Portfolio"
                                data={demoRiskReturnPortfolio}
                                fill="#2563eb"
                            />
                            <Scatter
                                name="Benchmark"
                                data={demoRiskReturnBenchmark}
                                fill="#9ca3af"
                            />

                            <ReferenceLine
                                y={riskFreeRate}
                                stroke="#60a5fa"
                                strokeDasharray="4 4"
                                label={{
                                    value: `Risikofreie Rendite (${percentFormatter(
                                        riskFreeRate
                                    )})`,
                                    position: "insideBottomLeft",
                                    fill: "#60a5fa",
                                    fontSize: 12,
                                }}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* -----------------------------
          2️⃣ Portfolio Verlauf (Zwei Linien)
      ------------------------------ */}
            {activeChart === "verlauf" && (
                <div className="single-chart-container">
                    <h3 className="chart-section-title">Portfolio Verlauf</h3>

                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart
                            data={demoVerlaufData}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Zeit",
                                    position: "insideRight",   // unterhalb der Achse
                                    offset: 15,
                                    style: { fontSize: 11 },
                                }}
                            />

                            <YAxis
                                tickFormatter={percentFormatter}
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Rendite (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -25,                          // weiter nach oben schieben
                                    style: { fontSize: 11, fontWeight: 500 },
                                }}
                            />





                            <Tooltip formatter={(v) => percentFormatter(v)} />
                            <Legend />

                            {/* Portfolio-Linie */}
                            <Line
                                name="Portfolio"
                                type="monotone"
                                dataKey="portfolio"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={false}
                            />

                            {/* Benchmark-Linie */}
                            <Line
                                name="Benchmark"
                                type="monotone"
                                dataKey="benchmark"
                                stroke="#9ca3af"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* -----------------------------
          3️⃣ Rolling Volatility
      ------------------------------ */}
            {activeChart === "rolling" && (
                <div className="single-chart-container">
                    <h3 className="chart-section-title">Rolling Volatility</h3>

                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart
                            data={demoRollingData}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Zeit",
                                    position: "insideRight",
                                    offset: 20,
                                    style: { fontSize: 11 },
                                }}
                            />

                            <YAxis
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Volatilität (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -25,
                                    style: { fontSize: 11, fontWeight: 500 },
                                }}
                            />

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
            )}
        </div>
    );
};

export default PortfolioChart;
