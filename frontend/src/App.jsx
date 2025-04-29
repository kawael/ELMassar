import "./App.css";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
const socket = io("http://localhost:3000/")


if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", { latitude, longitude });
  },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}

import { useState } from "react";



export default function App() {
  const [markers, setMarkers] = useState([]);
  const [lines, setLines] = useState([]); // State to store lines

  socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    setMarkers((prevMarkers) => {
      const newMarkers = { ...prevMarkers };
      newMarkers[id] = { latitude, longitude };
      return newMarkers;
    });
  });

  socket.on("target-data", (data) => {
    const { coordinates } = data; // Assuming coordinates is an array of [latitude, longitude] pairs
    setLines((prevLines) => [...prevLines, coordinates]);
  });

  socket.on("disconnect", (data) => {
    const { id } = data;
    setMarkers((prevMarkers) => {
      const newMarkers = { ...prevMarkers };
      delete newMarkers[id];
      return newMarkers;
    });
  });

  return (
    <MapContainer
      className="markercluster-map"
      center={[0, 0]}
      zoom={4}
      maxZoom={18}
      minZoom={2}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {Object.keys(markers).map((key) => {
        const { latitude, longitude } = markers[key];
        return <Marker key={key} position={[latitude, longitude]}></Marker>;
      })}

      {lines.map((line, index) => (
        <Polyline key={index} positions={line} />
      ))}
    </MapContainer>
  );
}
