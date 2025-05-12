import React, { useState } from "react";
import { useMap } from "react-leaflet";

export default function Sidebar({ targets,setTarget, tooltipDetails }) {
return (
    <div className="sidebar bg-night-black border border-l-0 border-y-0 border-r-1 border-gray-800 shadow-zinc-700 p-4 w-64">
        <div className="logo mb-6 flex justify-center">
            <img src="/logo.png" alt="Logo" className="w-20 h-20" />
        </div>
        <div className="targets mb-6" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <div className="pl-4 text-xl tracking-wide underline">Convoies:</div>
            <select
                className="list bg-base-100 rounded-box border py-2 w-full"
                onChange={(e) => {  console.log("Changed:", e.target.value);
                    setTarget((prevOptions) => {
                    const updatedOptions = { ...prevOptions };
                    
                    Object.keys(updatedOptions).forEach((key) => {
                      updatedOptions[key] = key === e.target.value;
                    });
                    return updatedOptions;
                  }); }}
            >
                {Object.keys(targets).map((targetId) => (
                    <option key={targetId} value={targetId} >
                        {targetId}
                    </option>
                ))}
            </select>
        </div>
        <div className="tooltip-details">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            {tooltipDetails.length > 0 && (
                <div className="mb-4 p-2 border border-desert-sand rounded">
                    <p>
                        <b>Last Point Latitude:</b> {tooltipDetails[tooltipDetails.length - 1].lat}
                    </p>
                    <p>
                        <b>Last Point Longitude:</b> {tooltipDetails[tooltipDetails.length - 1].lng}
                    </p>
                    <p>
                        <b>Last Point Timestamp:</b>{" "}
                        {new Date(tooltipDetails[tooltipDetails.length - 1].timestamp).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    </div>
);
}

const ArrowIcon = ({ position, tooltipDetails }) => {
  return (
    <Marker position={position} icon={ArrowIcon()}> {/* Reuse the ArrowIcon function */}
      <Tooltip
        direction="top"
        offset={[0, -10]}
        opacity={1}
        permanent={false}
        sticky
      >
        <div
          style={{
            backgroundColor: "#2E2E2E",
            color: "#D4AF37",
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #4B5320",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "12px",
            margin: 0,
          }}
        >
          <span>
            <b>Latitude:</b> {tooltipDetails.lat}
          </span>
          <br />
          <span>
            <b>Longitude:</b> {tooltipDetails.lng}
          </span>
          <br />
          <span>
            <b>Timestamp:</b> {new Date(tooltipDetails.timestamp).toLocaleString()}
          </span>
        </div>
      </Tooltip>
    </Marker>
  );
};