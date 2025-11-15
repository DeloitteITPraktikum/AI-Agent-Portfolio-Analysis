// Komponente für Tooltip (Infobox bei Hover)
import React from "react";

export default function InfoTooltip({ label, text }) {
    return (
        <span className="tooltip-wrapper">
            {/* Text, über den man mit der Maus hovert */}
            {label}

            {/* Box, die bei Hover angezeigt wird */}
            <span className="tooltip-box">{text}</span>
        </span>
    );
}
