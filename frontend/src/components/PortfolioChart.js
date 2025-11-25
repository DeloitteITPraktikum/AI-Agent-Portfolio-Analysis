// src/components/PortfolioChart.js
import React from "react";
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


    //  Demo-Chart
    const demoData = [
        { name: "Jan", value: 100 },
        { name: "Feb", value: 120 },
        { name: "Mär", value: 90 },
        { name: "Apr", value: 130 },
        { name: "Mai", value: 150 },
    ];

    // 如果你已经想用 portfolioData 做一点点图，也可以简单 map 一下，比如：
    // const data = portfolioData.map((row, index) => ({
    //   name: row.Ticker || `Pos ${index + 1}`,
    //   value: Number(row.Kaufpreis) || 0,
    // }));
    // 先用 demoData，避免还没上传文件时 chart 是空的：
    const data = demoData;

    return (
        <div className="chart-wrapper">
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
    );
};

export default PortfolioChart;
