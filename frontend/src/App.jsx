import "./App.css";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Polyline, useMap, Marker, LayersControl, Tooltip } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";

// const socket = io("http://localhost:3000/");
const socket = io("https://special-doodle-xpwp59w7xx36vxj-3000.app.github.dev/");
if (!socket) {
  console.error("Socket connection failed.");
}
const targetColors = {
  "Convoi 1": "#D72638",
  "Convoi 2": "#D72638",
  "Convoi 3": "#D72638",
};

const customIcon = (color) => {
  return new L.DivIcon({
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    bgPos: [0, 0],
    className: "custom-icon",
    html: `<svg fill="${color}" 
    version="1.1" xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 329.015 329.015" xml:space="preserve">
    
    <path d="M164.508,71.909c-51.059,0-92.599,41.54-92.599,92.599c0,51.059,41.54,92.599,92.599,92.599s92.599-41.54,92.599-92.599 C257.107,113.449,215.568,71.909,164.508,71.909z M164.508,239.107c-41.134,0-74.599-33.465-74.599-74.599 c0-41.134,33.465-74.599,74.599-74.599c41.134,0,74.599,33.465,74.599,74.599C239.107,205.642,205.643,239.107,164.508,239.107z"></path> <path d="M164.508,137.639c-14.815,0-26.869,12.053-26.869,26.869c0,14.816,12.053,26.869,26.869,26.869 c14.816,0,26.869-12.053,26.869-26.869C191.378,149.692,179.323,137.639,164.508,137.639z M164.508,173.376 c-4.89,0-8.869-3.979-8.869-8.869c0-4.89,3.979-8.869,8.869-8.869s8.869,3.979,8.869,8.869 C173.378,169.397,169.398,173.376,164.508,173.376z"></path> <path d="M320.016,155.508h-8.934C306.596,81.685,247.333,22.42,173.51,17.935V9c0-4.971-4.029-9-9-9c-4.971,0-9,4.029-9,9v8.934 C81.685,22.42,22.42,81.685,17.935,155.508H9c-4.971,0-9,4.029-9,9s4.029,9,9,9h8.934 c4.486,73.823,63.75,133.088,137.573,137.573v8.934c0,4.971,4.029,9,9,9s9-4.029,9-9v-8.934 c73.823-4.486,133.088-63.75,137.573-137.573h8.934c4.971,0,9-4.029,9-9S324.987,155.508,320.016,155.508z M293.047,173.486 c-4.42,63.912-55.649,115.141-119.561,119.561c-0.228-4.768-4.154-8.566-8.978-8.566s-8.75,3.798-8.978,8.566 c-63.912-4.421-115.141-55.65-119.561-119.562c4.768-0.228,8.566-4.154,8.566-8.978c0-4.824-3.798-8.75-8.566-8.978 c4.42-63.911,55.649-115.14,119.561-119.561c0.228,4.768,4.154,8.566,8.978,8.566s8.75-3.798,8.978-8.566 c63.912,4.421,115.141,55.65,119.561,119.562c-4.768,0.228-8.566,4.154-8.566,8.978S288.279,173.258,293.047,173.486z"></path> </svg>`
  });
};

function MapUpdater({ polyline }) {
  const map = useMap();

  useEffect(() => {
    if (polyline.length > 0) {
      const lastPoint = polyline[polyline.length - 1];
      map.flyTo(lastPoint, map.getMaxZoom(), { animate: true });
    }
  }, [polyline, map]);

  return null;
}

export default function App() {
  const [polylines, setPolylines] = useState({});
  const [selectedMap, setSelectedMap] = useState(null);

  useEffect(() => {
    socket.on("historical-locations", (data) => {
      // console.log("Received historical locations:",typeof (data));
      
      const parsedData = JSON.parse(data);
      const newPolylines = {};
      parsedData.forEach((target) => {
        const { id, locations } = target;
        newPolylines[id] = locations.map((location) => [location.lat, location.lng]);
      });
      setPolylines(newPolylines);
    });

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
      // socket.off("receive-location");
    };
  }, []);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    setSelectedMap(selected);
    if (polylines[selected]) {
      console.log("Polyline for", selected, ":", polylines[selected]);
    }
  };

  return (
    <div className="p-4 bg-military-green min-h-screen font-military">
      <h1 className="text-3xl font-bold text-center text-desert-sand mb-6">El-Massare</h1>
      <div className="mb-4">
        <label htmlFor="map-select" className="block text-desert-sand mb-2">Select Map:</label>
        <select
          id="map-select"
          className="p-2 rounded bg-night-black text-desert-sand border border-camouflage-brown"
          value={selectedMap || ""}
          onChange={handleSelectChange}
        >
          <option value="" disabled>Select a map</option>
          {Object.keys(polylines).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      {selectedMap && (
        <div
          className="bg-camouflage-brown shadow-md rounded-lg overflow-hidden border border-night-black"
        >
          <div className="flex justify-between items-center bg-night-black py-2 px-4">
            <h3 className="text-lg font-semibold text-desert-sand">{selectedMap}</h3>
          </div>
          <MapContainer
            className="markercluster-map"
            style={{ height: "500px", width: "100%" }}
            center={[0, 0]}
            zoom={4}
            
            maxZoom={15}
            minZoom={1} fullscreenControl={true}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite">
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Topographie">
                <TileLayer
                  url="http://192.213.10.93:13606/{z}/{x}/{y}.png"
                  // server geoserver 1RM
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <MapUpdater polyline={polylines[selectedMap]} />
            <Polyline positions={polylines[selectedMap]} color={targetColors[selectedMap]} />
            
            {polylines[selectedMap]?.map((position, index, array) => (
              <Marker key={index} position={position} icon={(index === array.length -1)? customIcon("Green"): customIcon("black")}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} sticky>
                  <span><b>Point {index + 1}:</b></span>
                  <br />
                  <span><b>Latitude:</b> {position[0]}</span>
                  <br />
                  <span><b>Longitude:</b> {position[1]}</span>
                  <br />
                  <span><b>Convoi:</b> {selectedMap}</span>
                </Tooltip>
              </Marker>
            ))}
            
          </MapContainer>
        </div>
      )}
    </div>
  );
}
