import "./App.css";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Polyline, useMap, Marker, LayersControl, Tooltip } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet-rotatedmarker";

const socket = io("http://localhost:3000/");
if (!socket) {
  console.error("Socket connection failed.");
}

const customIcon = (color, animate) => {
  return new L.DivIcon({
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    bgPos: [0, 0],
    className: "custom-icon",
    html: `
      <div class="ripple-container">
        <svg fill="${color}" 
          version="1.1" xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink" 
          viewBox="0 0 329.015 329.015" xml:space="preserve">
          <path d="M164.508,71.909c-51.059,0-92.599,41.54-92.599,92.599c0,51.059,41.54,92.599,92.599,92.599s92.599-41.54,92.599-92.599 C257.107,113.449,215.568,71.909,164.508,71.909z M164.508,239.107c-41.134,0-74.599-33.465-74.599-74.599 c0-41.134,33.465-74.599,74.599-74.599c41.134,0,74.599,33.465,74.599,74.599C239.107,205.642,205.643,239.107,164.508,239.107z"></path>
          <path d="M164.508,137.639c-14.815,0-26.869,12.053-26.869,26.869c0,14.816,12.053,26.869,26.869,26.869 c14.816,0,26.869-12.053,26.869-26.869C191.378,149.692,179.323,137.639,164.508,137.639z M164.508,173.376 c-4.89,0-8.869-3.979-8.869-8.869c0-4.89,3.979-8.869,8.869-8.869s8.869,3.979,8.869,8.869 C173.378,169.397,169.398,173.376,164.508,173.376z"></path>
          <path d="M320.016,155.508h-8.934C306.596,81.685,247.333,22.42,173.51,17.935V9c0-4.971-4.029-9-9-9c-4.971,0-9,4.029-9,9v8.934 C81.685,22.42,22.42,81.685,17.935,155.508H9c-4.971,0-9,4.029-9,9s4.029,9,9,9h8.934 c4.486,73.823,63.75,133.088,137.573,137.573v8.934c0,4.971,4.029,9,9,9s9-4.029,9-9v-8.934 c73.823-4.486,133.088-63.75,137.573-137.573h8.934c4.971,0,9-4.029,9-9S324.987,155.508,320.016,155.508z M293.047,173.486 c-4.42,63.912-55.649,115.141-119.561,119.561c-0.228-4.768-4.154-8.566-8.978-8.566s-8.75,3.798-8.978,8.566 c-63.912-4.421-115.141-55.65-119.561-119.562c4.768-0.228,8.566-4.154,8.566-8.978c0-4.824-3.798-8.75-8.566-8.978 c4.42-63.911,55.649-115.14,119.561-119.561c0.228,4.768,4.154,8.566,8.978,8.566s8.75-3.798,8.978-8.566 c63.912,4.421,115.141,55.65,119.561,119.562c-4.768,0.228-8.566,4.154-8.566,8.978S288.279,173.258,293.047,173.486z"></path>
        </svg>
      </div>
    `,
  });
};
const ArrowIcon = () => {
  return new L.DivIcon({
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    bgPos: [0, 0],
    className: "dir-icon",
    html: `<div class="ripple-container">
        <svg viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Layer_2"> <path d="M27.86,29.46L16.94,1.66c-0.1-0.27-0.31-0.49-0.58-0.59c-0.05-0.02-0.11-0.04-0.17-0.05 C16.13,1.01,16.07,1,16,1s-0.13,0.01-0.19,0.02c-0.06,0.01-0.12,0.03-0.17,0.05c-0.25,0.1-0.46,0.3-0.57,0.56l-0.01,0.03 L4.07,29.63C3.92,30,4.01,30.42,4.29,30.7C4.48,30.9,4.74,31,5,31c0.12,0,0.24-0.02,0.36-0.07L16,26.87l10.64,4.06 C26.76,30.98,26.88,31,27,31c0.01,0,0.01,0,0.02,0c0.55,0,1-0.45,1-1C28.02,29.8,27.96,29.62,27.86,29.46z" fill="#20f339"></path> <g> <path d="M28.02,30c0,0.55-0.45,1-1,1c-0.01,0-0.01,0-0.02,0c-0.12,0-0.24-0.02-0.36-0.07L16,26.87V1 c0.07,0,0.13,0.01,0.19,0.02c0.06,0.01,0.12,0.03,0.17,0.05c0.27,0.1,0.48,0.32,0.58,0.59l10.92,27.8 C27.96,29.62,28.02,29.8,28.02,30z" fill="#16d419"></path> </g> </g> <g id="Layer_3"></g> <g id="Layer_4"></g> <g id="Layer_5"></g> <g id="Layer_6"></g> <g id="Layer_7"></g> <g id="Layer_8"></g> <g id="Layer_9"></g> <g id="Layer_10"></g> <g id="Layer_11"></g> <g id="Layer_12"></g> <g id="Layer_13"></g> <g id="Layer_14"></g> <g id="Layer_15"></g> <g id="Layer_16"></g> <g id="Layer_17"></g> <g id="Layer_18"></g> <g id="Layer_19"></g> <g id="Maps_11_"></g> <g id="Maps_10_"></g> <g id="Maps_9_"></g> <g id="Maps_8_"></g> <g id="Maps_7_"></g> <g id="Maps_6_"></g> <g id="Maps_5_"></g> <g id="Maps_4_"></g> <g id="Maps_3_"></g> <g id="Maps_2_"></g> <g id="Maps_1_"></g> <g id="Maps"></g> </g></svg>  
      </div>
      <div class="ripple"></div>
      `,
  });
};
// Add the following CSS to your project for the ripple effect
const style = document.createElement("style");
style.innerHTML = `
  .ripple-container {
    position: relative;
    width: 32px;
    height: 32px;
  }
  .ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 32px;
    height: 32px;
    background-color: rgba(0, 255, 0, 0.9);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple-animation 1.5s infinite;
  }
  @keyframes ripple-animation {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const dLng = toRadians(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360; // Bearing in degrees
}

function MapUpdater({ polyline }) {
  const map = useMap();
  const [directionMarker, setDirectionMarker] = useState(null);

  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const lastPoint = polyline[polyline.length - 1];
      if (lastPoint) {
        map.flyTo(lastPoint, map.getMaxZoom(), { animate: true });
      }
    }

    return () => {};
  }, [polyline, map]);

  useEffect(() => {
    if (polyline && polyline.length > 1) {
      const lastPoint = polyline[polyline.length - 1];
      const secondLastPoint = polyline[polyline.length - 2];

      const bearing = calculateBearing(
        secondLastPoint.lat,
        secondLastPoint.lng,
        lastPoint.lat,
        lastPoint.lng
      );

      if (!directionMarker) {
        const marker = L.marker([lastPoint.lat, lastPoint.lng], {
          icon: ArrowIcon(),
          rotationAngle: bearing,
        }).addTo(map);
        setDirectionMarker(marker);
      } else {
        directionMarker.setLatLng([lastPoint.lat, lastPoint.lng]);
        directionMarker.setRotationAngle(bearing);
      }
    }
  }, [polyline, map, directionMarker]);

  return null;
}

function calculateDistance(polyline) {
  if (!polyline || polyline.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < polyline.length; i++) {
    const prevPoint = L.latLng(polyline[i - 1].lat, polyline[i - 1].lng);
    const currentPoint = L.latLng(polyline[i].lat, polyline[i].lng);
    totalDistance += prevPoint.distanceTo(currentPoint); // Distance in meters
  }

  return totalDistance / 1000; // Convert to kilometers
}

export default function App() {
  const [polylines, setPolylines] = useState({});
  const [optionsMap, setOptionsMap] = useState({});
  const mapRefs = useRef({});

  useEffect(() => {
    socket.emit("request-target-ids");

    socket.on("target-ids", (ids) => {
      const newOption = {};
      ids.forEach((targetId) => {
        newOption[targetId.name] = [];
        
        setOptionsMap(newOption);
        console.log("Target IDs:", targetId.name);
        console.log("Polylines:", polylines);
        socket.emit("select-target", targetId.name);
        
      });
      
    });
    socket.on("historical-locations", (data) => {
      console.log("Data: ",data)
      setPolylines((prevPolylines) => {
        const newPolylines = { ...prevPolylines };
        if (!newPolylines[data.targetId]) newPolylines[data.targetId] = data.locations;
        
        return newPolylines;
      });
    //     var locations = [];
    //     data.locations.forEach((target) => {
    //       const { lat, lng, timestamp } = target;
            
    //         // locations = polylines;
    //         const existingLocation = locations.find((location) => location.lat === lat && location.lng === lng);
    //         if (!existingLocation) {
    //           locations.push({ lat, lng, timestamp });
    //         }
          
    //     });
    //     setPolylines((prevPolylines) => ({
    //       ...prevPolylines,
    //       [targetId.name]: locations,
    //     }));
    });
    return () => {
      socket.off("target-ids");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(optionsMap).forEach((targetId) => {
        socket.emit("request-last-location", targetId);
      });
    }, 10000);

    socket.on("last-location", (data) => {
      const { id, latitude, longitude, timestamp } = data;
      setPolylines((prevPolylines) => {
        const newPolylines = { ...prevPolylines };
        if (!newPolylines[id]) newPolylines[id] = [];
        const exists = newPolylines[id].some(
          (point) =>
            point.lat === latitude &&
            point.lng === longitude &&
            point.timestamp === timestamp
        );
        if (!exists) {
          newPolylines[id].push({ lat: latitude, lng: longitude, timestamp });
        }
        return newPolylines;
      });
    });

    return () => {
      clearInterval(interval);
      socket.off("last-location");
    };
  }, [optionsMap]);

  

  useEffect(() => {
    socket.on("last-location", (data) => {
      console.log("Received last-location data:", data);
    });
  }, []);

  const distanceWalked = (polyline) => calculateDistance(polyline);

  return (
    <div className="p-4 bg-military-green min-h-screen font-military">
      <h1 className="text-3xl font-bold text-center text-desert-sand mb-6">
        El-Massar
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(optionsMap).map((targetId) => (
          <div
            key={targetId}
            className="bg-camouflage-brown shadow-md rounded-lg overflow-hidden border border-night-black"
          >
            <div className="flex justify-between items-center bg-night-black py-2 px-4">
              <h3 className="text-lg font-semibold text-desert-sand">
                {targetId}
              </h3>
              <span className="text-desert-sand">
                Distance parcourue: {distanceWalked(polylines[targetId] || []).toFixed(2)} km
              </span>
            </div>
            <MapContainer
              className="markercluster-map"
              style={{ height: "500px", width: "100%" }}
              center={[0, 0]}
              zoom={4}
              maxZoom={15}
              minZoom={1}
              fullscreenControl={true}
              whenCreated={(mapInstance) => {
                mapRefs.current[targetId] = mapInstance;
              }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite">
                  <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street Map">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="3°RM">
                  <TileLayer url="http://192.213.30.60/satellite/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
              </LayersControl>
              <MapUpdater polyline={polylines[targetId] || []} />
              <Polyline positions={polylines[targetId] || []} />
              {(polylines[targetId] || []).map((position, index, array) =>
                index < array.length - 1 ? (
                  <Marker
                    key={index}
                    position={position}
                    icon={customIcon("black", false)}
                  >
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
                          <b>Convoi:</b> {targetId}
                        </span>
                        <br />
                        <span>
                          <b>Point:</b> {index + 1}
                        </span>
                        <br />
                        <span>
                          <b>Latitude:</b> {position.lat}
                        </span>
                        <br />
                        <span>
                          <b>Longitude:</b> {position.lng}
                        </span>
                        <br />
                        <span>
                          <b>Timestamp:</b> {new Date(
                            position.timestamp
                          ).toLocaleString()}
                        </span>
                      </div>
                    </Tooltip>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
