// src/pages/KursdatenPage.js
import React from "react";
import Kursdaten from "../components/Kursdaten";

// Seite für Kursdaten, die im Sidebar als eigener Menüpunkt erscheint
const KursdatenPage = () => {
    return (
        <div className="page-wrapper">
            {/* Hauptüberschrift der Seite */}
            <h1 className="page-title">Kursdaten</h1>

            {/* Demo-Chart für Kursverläufe */}
            <Kursdaten />
        </div>
    );
};

export default KursdatenPage;
