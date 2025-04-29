import "./App.css";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

const socket = io("https://special-doodle-xpwp59w7xx36vxj-3000.app.github.dev/");

// Couleurs pour chaque cible
const targetColors = {
  Tindouf: "blue",
  Bechar: "red",
  "beni Abess": "green",
};

// Composant pour zoomer sur une polyline
function MapUpdater({ polyline }) {
  const map = useMap();

  useEffect(() => {
    if (polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline, map]);

  return null;
}

export default function App() {
  const [polylines, setPolylines] = useState({}); // Stocker les lignes pour chaque utilisateur

  useEffect(() => {
    // Écouter les données historiques
    socket.on("historical-locations", (data) => {
      const newPolylines = {};

      // Parcourir les cibles et leurs emplacements
      data.targets.forEach((target) => {
        const { id, locations } = target;

        // Ajouter les coordonnées pour chaque cible
        newPolylines[id] = locations.map((location) => [location.lat, location.lng]);
      });

      setPolylines(newPolylines);
    });

    // Écouter les nouvelles localisations en temps réel
    socket.on("receive-location", (data) => {
      const { id, latitude, longitude } = data;

      setPolylines((prevPolylines) => {
        const newPolylines = { ...prevPolylines };
        if (!newPolylines[id]) {
          newPolylines[id] = [];
        }
        newPolylines[id].push([latitude, longitude]);
        return newPolylines;
      });
    });

    return () => {
      socket.off("historical-locations");
      socket.off("receive-location");
    };
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {Object.keys(polylines).map((key) => (
        <div key={key} style={{ width: "45%", height: "400px" }}>
          <h3>{key}</h3>
          <MapContainer
            className="markercluster-map"
            style={{ height: "100%", width: "100%" }}
            center={[0, 0]}
            zoom={4}
            maxZoom={18}
            minZoom={2}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <MapUpdater polyline={polylines[key]} />

            <Polyline positions={polylines[key]} color={targetColors[key] || "black"} />
          </MapContainer>
        </div>
      ))}
    </div>
  );
}
