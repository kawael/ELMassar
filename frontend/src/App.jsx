import "./App.css";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useState, useEffect } from "react";

const socket = io("https://special-doodle-xpwp59w7xx36vxj-3000.app.github.dev/");

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

function MapUpdater({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (Object.keys(markers).length > 0) {
      const bounds = Object.values(markers).map(({ latitude, longitude }) => [
        latitude,
        longitude,
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

export default function App() {
  const [markers, setMarkers] = useState({});
  const [polylines, setPolylines] = useState({}); // Stocker les lignes pour chaque utilisateur

  useEffect(() => {
    socket.on("receive-location", (data) => {
      const { id, latitude, longitude } = data;

      setMarkers((prevMarkers) => {
        const newMarkers = { ...prevMarkers };
        newMarkers[id] = { latitude, longitude };
        return newMarkers;
      });

      setPolylines((prevPolylines) => {
        const newPolylines = { ...prevPolylines };
        if (!newPolylines[id]) {
          newPolylines[id] = [];
        }
        newPolylines[id].push([latitude, longitude]);
        return newPolylines;
      });
    });

    socket.on("disconnect", (data) => {
      const { id } = data;
      setMarkers((prevMarkers) => {
        const newMarkers = { ...prevMarkers };
        delete newMarkers[id];
        return newMarkers;
      });

      setPolylines((prevPolylines) => {
        const newPolylines = { ...prevPolylines };
        delete newPolylines[id];
        return newPolylines;
      });
    });

    return () => {
      socket.off("receive-location");
      socket.off("disconnect");
    };
  }, []);

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

      <MapUpdater markers={markers} />

      {Object.keys(markers).map((key) => {
        const { latitude, longitude } = markers[key];
        return <Marker key={key} position={[latitude, longitude]}></Marker>;
      })}

      {Object.keys(polylines).map((key) => (
        <Polyline key={key} positions={polylines[key]} color="blue" />
      ))}
    </MapContainer>
  );
}
